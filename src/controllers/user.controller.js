import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { response } from "express";
import mongoose from "mongoose";

const options = {
    httpOnly: true,
    secure: true,
};

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
    if (
        [userName, userEmail, fullName, password].some((field) => field === "")
    ) {
        throw new ApiError(400, "All fields are required", [], "Bad Request");
    }
    const userExists = await User.findOne({
        $or: [{ userName }, { userEmail }],
    });

    if (userExists) {
        throw new ApiError(400, "User already exists", [], "Bad Request");
    }
    console.log("req.files", req.files);
    if (!req.files?.avatar?.[0]) {
        throw new ApiError(400, "Please provide avatar", [], "Bad Request");
    }
    let coverImageLocalPath = "";
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatarLocalPath = req.files.avatar[0].path;
    const isAvatarUploded = await uploadOnCloudinary(avatarLocalPath);
    const isCoverImageUploded = await uploadOnCloudinary(coverImageLocalPath);
    if (isAvatarUploded === null) {
        throw new ApiError(
            500,
            "Failed to upload images",
            [],
            "Internal Server Error",
        );
    }

    try {
        const newUser = new User({
            userName: userName.toLowerCase(),
            userEmail,
            fullName,
            password,
            isAdmin: isAdmin || false,
            avatar: isAvatarUploded.url,
            coverImage: isCoverImageUploded?.url || "",
        });

        const newUserCreated = await User.create(newUser);

        const isNewUserCreated = await User.findById(newUserCreated._id).select(
            "-password -refreshToken",
        );
        if (!isNewUserCreated) {
            throw new ApiError(
                500,
                "Failed to create user",
                [],
                "Internal Server Error",
            );
        }

        return res.status(201).json({
            response: new ApiResponse(
                200,
                isNewUserCreated,
                "User Created",
                200,
            ),
        });
    } catch (exception) {
        console.error("User registration error:", exception);
        if (exception.code === 11000) {
            throw new ApiError(
                400,
                "Duplicate key error: User already exists",
                [],
                "Bad Request",
            );
        }
        throw exception;
    }
});

const generateJWTTokens = async (user) => {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(404, "jwt token generation failed", [], "Not Found");
    }
};

const loginUser = asyncHandler(async (req, res) => {
    // pick data from req body
    // username or useremail
    // fetch user from db
    // match password
    // generate access and ref toekns
    //send cookie

    const { userEmail, userName, password } = req.body;
    if ((!userEmail || !userName) && !password) {
        throw new ApiError(
            404,
            "Send username or useremail and password",
            [],
            "Not Found",
        );
    }
    const user = await User.findOne({
        $or: [{ userName: userName }, { userEmail: userEmail }],
    });
    if (!user) {
        throw new ApiError(404, "No user exist", [], "Not Found");
    }
    const isCorrectPassword = await user.isPasswordCorrect(password);
    if (!isCorrectPassword) {
        throw new ApiError(404, "Incorrect Password", [], "Not Found");
    }
    const { accessToken, refreshToken } = await generateJWTTokens(user);
    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: user,
                    accessToken,
                    refreshToken,
                },
                "user logged in successfully",
            ),
        );
});

const logOutUser = asyncHandler(async (req, res) => {
    // clear cokkie
    try {
        await User.findByIdAndUpdate(req.user._id),
            {
                $set: {
                    refreshToken: undefined,
                },
            };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(201, {}, "Logout SucessFul"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Logout Failed");
    }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingToken =
            req.cookies?.refreshToken || req.header("refreshToken");
        if (!incomingToken) {
            throw new ApiError(400, "refresh token missing");
        }

        const decodedToken = jwt.verify(
            incomingToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        const userID = decodedToken._id;

        const user = await User.findById(userID).select("-password");

        if (!user) {
            throw new ApiError(400, "Invalid Refreshtoken");
        }
        if (user.refreshToken !== incomingToken) {
            throw new ApiError(400, "Token Expired or Used");
        }
        const { refreshToken, accessToken } = await generateJWTTokens(user);

        return res
            .status(201)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        refreshToken: refreshToken,
                        accessToken: accessToken,
                    },
                    "Tokens Refreshed",
                ),
            );
    } catch (error) {
        console.error("Refresh token error:", error);
        throw new ApiError(401, error.message || "Invalid refresh token");
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const { userID } = req.query;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(400, "user doesnt exist");
    }
    await deleteFromCloudinary(isUserExist.avatar.public_id);
    await deleteFromCloudinary(isUserExist.coverImage.public_id);
    const userDeleted = await User.findByIdAndDelete(userID).lean();
    if (!userDeleted) {
        throw new ApiError(400, "Cant fullfill opertaion");
    }
    // Convert the deleted user to a plain object to avoid circular references
    // const userDeletedPlain = userDeleted.toObject();
    return res.status(201).json({
        response: new ApiResponse(200, userDeleted, "User Deleted", 200),
    });
});

const getAllUSers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken");

    if (!users || users.length === 0) {
        throw new ApiError(404, "No users found", [], "Not Found");
    }

    return res.status(200).json({
        response: new ApiResponse(
            200,
            users,
            "Users fetched successfully",
            200,
        ),
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const incomingAccessToken =
        req.cookies?.accessToken || req.header("accessToken");
    const { currentPassword, newPassword } = req.body;
    if (!incomingAccessToken) {
        throw new ApiError(401, "Invalid request");
        // logOutUser();
    }
    const user = await User.findById(req.user._id);
    // this is all is being done by middleware
    // const decodedToekn = jwt.verify(incomingAccessToken, process.env.ACCESS_TOKEN_SECRET);
    // if (!decodedToekn) {
    //     throw new ApiError(401, "Invalid request");
    //     // logOutUser();
    // }
    // const user = await User.findById(decodedToekn._id);
    // if (!user) {
    //     throw new ApiError(401, "Invalid request");
    //     // logOutUser();
    // }
    console.log(user.password);
    const isPasswordMatch = user.isPasswordCorrect(currentPassword);
    if (!isPasswordMatch) {
        throw new ApiError(401, "Incorrect Password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(201).json({
        response: new ApiResponse(201, "Password changed"),
    });
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json({
        response: new ApiResponse(200, req.user, "Current user info"),
    });
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { userEmail, fullName } = req.body;
    if (!userEmail || !fullName) {
        return res.status(200).json({
            response: new ApiResponse(201, "Nothing to update"),
        });
    }
    const user = req.user;
    if (userEmail) user.userEmail = userEmail;
    if (fullName) user.fullName = fullName;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
        response: new ApiResponse(
            201,
            {
                userEmail: userEmail,
                fullName: fullName,
            },
            "Update Complete",
        ),
    });
});

const updateUserMedia = asyncHandler(async (req, res) => {
    let coverImageLocalPath = "";
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    let avatarPath = "";
    if (
        req.files &&
        Array.isArray(req.files.avatar) &&
        req.files.avatar.length > 0
    ) {
        avatarPath = req.files.avatar[0].path;
    }

    if (coverImageLocalPath === "" && avatarPath === "") {
        throw new ApiError(500, "Nothing to upload");
    }
    const user = req.user;
    const isAvatarUploded = await uploadOnCloudinary(avatarPath);
    const isCoverImageUploded = await uploadOnCloudinary(coverImageLocalPath);

    // if avatar uploeded delete previous images

    if (avatarPath !== "") {
        if (isAvatarUploded === null) {
            throw new ApiError(
                500,
                "Failed to upload avatar",
                [],
                "Internal Server Error",
            );
        }
        await deleteFromCloudinary(user.avatar.public_id);
        user.avatar = {
            url: isAvatarUploded.url,
            public_id: isAvatarUploded.public_id,
        };
    }

    if (coverImageLocalPath !== "") {
        if (isCoverImageUploded === null) {
            throw new ApiError(
                500,
                "Failed to upload cover image",
                [],
                "Internal Server Error",
            );
        }
        await deleteFromCloudinary(user.coverImage.public_id);
        user.coverImage = {
            url: isCoverImageUploded.url,
            public_id: isCoverImageUploded.public_id,
        };
    }
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
        response: new ApiResponse(201, "Update Complete"),
    });
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params;
    if (!userName?.trim()) {
        throw new ApiError(400, "invalid username");
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: userName.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                subcribeToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    if: { $in: [req.user._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false,
                },
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                subcribeToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(400, "Channel doesnt exist");
    }
    console.log("channle", channel);

    return res.status(201).json({
        response: new ApiResponse(
            201,
            channel[0],
            "User channel fetched successfully",
        ),
    });
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
    const pipeline = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        userName: 1,
                                        _id: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res.status(201).json({
        response: new ApiResponse(
            201,
            pipeline.watchHistory,
            "watch history fetched",
        ),
    });
});

export {
    registerUser,
    deleteUser,
    getAllUSers,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserMedia,
    getUserChannelProfile,
    getUserWatchHistory,
};
