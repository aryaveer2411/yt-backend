import { asyncHandler } from '../../utils/asyncHandler.js';
import { User } from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';
import { ApiResponse } from "../../utils/apiResponse.js";

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

export { registerUser };



