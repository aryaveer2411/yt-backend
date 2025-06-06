import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const userID = req.user._id;
    if (!userID) {
        throw new ApiError(401, "User is logged out");
    }
    const { channelId } = req.params;
    if (!channelId) {
        throw new ApiError(401, "Enter channel id");
    }
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(401, "Channel with this id doesnt exist");
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: userID,
        channel: channelId,
    });

    if (isSubscribed) {
        await Subscription.deleteOne({
            subscriber: userID,
            channel: channelId,
        });
        return res.status(200).json({
            response: new ApiResponse(200, null, "Subscription removed"),
        });
    } else {
        const subscribeToChannel = Subscription({
            subscriber: userID,
            channel: channelId,
        });
        const sub = await Subscription.create(subscribeToChannel);

        if (!sub) {
            throw new ApiError(400, "Cant save sub in db");
        }

        return res.status(200).json({
            response: new ApiResponse(200, sub, "Subscription done"),
        });
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscribers = await User.aggregate([
        {
            $match: {
                _id: channelId,
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribers",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                }
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                avatar: 1,
                coverImage: 1,
            },
        },
    ]);
    if (!subscribers?.length) {
        throw new ApiError(400, "Subscribers doesnt exist");
    }
    console.log("subscribers", subscribers);

    return res.status(201).json({
        response: new ApiResponse(
            201,
            subscribers,
            "subscribers fetched successfully",
        ),
    });
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const channels = await User.aggregate([
        {
            $match: {
                _id: subscriberId,
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribedChannels",
            },
        },
        {
            $addFields: {
                subscribedChannels: {
                    $size: "$subscribedChannels",
                },
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribedChannels: 1,
                avatar: 1,
                coverImage: 1,
            },
        },
    ]);
    if (!channels?.length) {
        throw new ApiError(400, "channels doesnt exist");
    }
    console.log("channels", channels);

    return res.status(201).json({
        response: new ApiResponse(
            201,
            channels,
            "channels fetched successfully",
        ),
    });
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
