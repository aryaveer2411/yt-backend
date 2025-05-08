import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // Destructure the request body to get user details
    // validate the request body to ensure all required fields are present
    // check if the user already exists in the database
    // check if images are provided in the request body and upload them to cloudinary
    // create a new user object with the provided details
    // remove the password field and tokens from the user object before saving it to the database
    //check if the user was saved successfully
    // if not, send a 500 error response
    // if the user was saved successfully, send a 201 response with the user details
    console.log("req.body", req.body);
    const { userName, userEmail, fullName, password, isAdmin } = req.body;
    if ([userName, userEmail, fullName, password].some(field => field === "")) {
        throw new ApiError(400, "All fields are required", [], "Bad Request");
    }
    const userExists = await User.findOne({ $or: [{ userName }, { userEmail }] });

    if (userExists) {
        throw new ApiError(400, "User already exists", [], "Bad Request");
    }
    console.log("req.files", req.files);
    if (!req.files?.avatar?.[0]) {
        throw new ApiError(400, "Please provide avatar", [], "Bad Request");
    }
    let coverImageLocalPath = "";
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatarLocalPath = req.files.avatar[0].path;
    const isAvatarUploded = await uploadOnCloudinary(avatarLocalPath);
    const isCoverImageUploded = await uploadOnCloudinary(coverImageLocalPath);
    if (isAvatarUploded === null) {
        throw new ApiError(500, "Failed to upload images", [], "Internal Server Error");
    }

    try {
        const newUser = new User({
            userName: userName.toLowerCase(),
            userEmail,
            fullName,
            password,
            isAdmin: isAdmin || false,
            avatar: isAvatarUploded.url,
            coverImage: isCoverImageUploded?.url || ""
        });

        const newUserCreated = await User.create(newUser);

        const isNewUserCreated = await User.findById(newUserCreated._id).select("-password -refreshToken");
        if (!isNewUserCreated) {
            throw new ApiError(500, "Failed to create user", [], "Internal Server Error");
        }

        return res.status(201).json({
            response: new ApiResponse(200, isNewUserCreated, "User Created", 200)
        })
    }
    catch (exception) {
        console.error("User registration error:", exception);
        if (exception.code === 11000) {
            throw new ApiError(400, "Duplicate key error: User already exists", [], "Bad Request");
        }
        throw exception;
    }

})


const generateJWTTokens = async (user) => {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(404, "jwt token generation failed", [], "Not Found");
    }
}

const loginUser = asyncHandler(async (req, res) => {
    // pick data from req body
    // username or useremail 
    // fetch user from db
    // match password
    // generate access and ref toekns
    //send cookie

    const { userEmail, userName, password } = req.body;
    if ((!userEmail || !userName) && !password) {
        throw new ApiError(404, "Send username or useremail and password", [], "Not Found");
    }
    const user = await User.findOne({
        $or: [
            { userName: userName },
            { userEmail: userEmail }
        ]
    });
    if (!user) {
        throw new ApiError(404, "No user exist", [], "Not Found");
    }
    const isCorrectPassword = await user.isPasswordCorrect(password);
    if (!isCorrectPassword) {
        throw new ApiError(404, "Incorrect Password", [], "Not Found");
    }
    const { accessToken, refreshToken } = await generateJWTTokens(user);
    console.log(accessToken);
    console.log(refreshToken);

    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(
            200,
            {
                user: user, accessToken, refreshToken
            },
            "user logged in successfully"
        )
    )
})

const logOutUser = asyncHandler(async (req, res) => {
    // clear cokkie 
    try {
        await User.findByIdAndUpdate(req.user._id), {
            $set: {
                refreshToken: undefined
            }
        }
        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
            new ApiResponse(201, {}, "Logout SucessFul")
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Logout Failed")
    }
})

const deleteUser = asyncHandler(async (req, res) => {
    const { userID } = req.query;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(400, "user doesnt exist");
    }
    const userDeleted = await User.findByIdAndDelete(userID).lean();
    if (!userDeleted) {
        throw new ApiError(400, "Cant fullfill opertaion");
    }
    // Convert the deleted user to a plain object to avoid circular references
    // const userDeletedPlain = userDeleted.toObject();
    return res.status(201).json({
        response: new ApiResponse(200, userDeleted, "User Deleted", 200)
    })
});


const getAllUSers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password -refreshToken');

    if (!users || users.length === 0) {
        throw new ApiError(404, "No users found", [], "Not Found");
    }

    return res.status(200).json({
        response: new ApiResponse(200, users, "Users fetched successfully", 200)
    });
});


export { registerUser, deleteUser, getAllUSers, loginUser, logOutUser };



