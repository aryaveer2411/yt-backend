import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const userId = req.user._id;
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId,
    });
    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json({
            response: new ApiResponse(200, null, "Video like removed"),
        });
    } else {
        const newLike = new Like({
            video: videoId,
            likedBy: userId,
        });
        await newLike.save();
        return res.status(201).json({
            response: new ApiResponse(201, newLike, "Video liked successfully"),
        });
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const userId = req.user._id;
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId,
    });
    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json({
            response: new ApiResponse(200, null, "Comment like removed"),
        });
    } else {
        const newLike = new Like({
            comment: commentId,
            likedBy: userId,
        });
        await newLike.save();
        return res.status(201).json({
            response: new ApiResponse(
                201,
                newLike,
                "Comment liked successfully",
            ),
        });
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const userId = req.user._id;
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId,
    });
    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json({
            response: new ApiResponse(200, null, "Tweet like removed"),
        });
    } else {
        const newLike = new Like({
            tweet: tweetId,
            likedBy: userId,
        });
        await newLike.save();
        return res.status(201).json({
            response: new ApiResponse(201, newLike, "Tweet liked successfully"),
        });
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const likedVideos = await Like.aggregate([
        { $match: { likedBy: userId, video: { $exists: true } } },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
            },
        },
        { $unwind: "$videoDetails" },
        {
            $replaceRoot: { newRoot: "$videoDetails" },
        },
    ]);
    if (!likedVideos || likedVideos.length === 0) {
        return res.status(404).json({
            response: new ApiResponse(404, null, "No liked videos found"),
        });
    }
    return res.status(200).json({
        response: new ApiResponse(
            200,
            likedVideos,
            "Liked videos fetched successfully",
        ),
    });
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
