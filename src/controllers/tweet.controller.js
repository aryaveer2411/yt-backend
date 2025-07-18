import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllTweets = asyncHandler(async (req, res) => { 
    const tweets = await Tweet.find({ });
    return res.status(200).json({
        response: new ApiResponse(200, tweets, "Tweets fetched"),
    });
});

const createTweet = asyncHandler(async (req, res) => {
    const { tweetData } = req.body;
    if (!tweetData || typeof tweetData !== "string" || tweetData.trim() === "") {
        throw new ApiError(400, "Invalid tweet data");
    }
    const userId = req.user._id;
    const tweet = Tweet({
        content: tweetData,
        owner: userId,
    });
    const tweetdb = await Tweet.create(tweet);
    if (!tweetdb) {
        throw new ApiError(400, "tweet creation failed");
    }
    return res.status(200).json({
        response : new ApiResponse(200,tweetdb,"Tweet Created")
    })
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    console.log(userId);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const tweets = await Tweet.find({ owner: userId });
    return res.status(200).json({
        response: new ApiResponse(200, tweets, "User tweets fetched"),
    });
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const {tweetData} = req.body;
    const userID = req.user._id;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: userID },
        { $set: { content: tweetData } },
        { new: true },
    );
    if (!tweet) {
        throw new ApiError(404, "Tweet not found or you are not the owner");
    }
    return res.status(200).json({
        response: new ApiResponse(200, tweet, "Tweet updated successfully"),
    });
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userID = req.user._id;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findOneAndDelete({ _id: tweetId, owner: userID });
    if (!tweet) {
        throw new ApiError(404, "Tweet not found or you are not the owner");
    }
    return res.status(200).json({
        response: new ApiResponse(200, null, "Tweet deleted successfully"),
    });
});

export {getAllTweets, createTweet, getUserTweets, updateTweet, deleteTweet };
