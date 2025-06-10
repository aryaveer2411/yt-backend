import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { response } from "express";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const videos = await Video.find({ isPublished: true }).select(
        "-isPublished",
    );

    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found", [], "Not Found");
    }

    return res.status(200).json({
        response: new ApiResponse(
            200,
            videos,
            "videos fetched successfully",
            200,
        ),
    });
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(400, "Please login first");
    }

    const { title, description } = req.body;
    if (!title) {
        throw new ApiError(400, "video title missing");
    }
    if (!description) {
        throw new ApiError(400, "video description missing");
    }

    const videoToUpload = req.files?.videoToUpload?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    if (!(videoToUpload && thumbnail)) {
        throw new ApiError(400, "Both video and thumbnail is required");
    }

    if (!(videoToUpload.path && thumbnail.path)) {
        throw new ApiError(
            400,
            "Path is missing for either  thumbnail or video",
        );
    }

    if (videoToUpload.mimetype !== "video/mp4") {
        throw new ApiError(400, "Only MP4 videos are allowed");
    }

    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedImageTypes.includes(thumbnail.mimetype)) {
        throw new ApiError(400, "Thumbnail must be a JPEG, PNG, or WEBP image");
    }

    const isVideoUploded = await uploadOnCloudinary(videoToUpload.path);

    const isThumbnailUploded = await uploadOnCloudinary(thumbnail.path);

    if (!(isVideoUploded && isThumbnailUploded)) {
        throw new ApiError(400, "Cloudinary upload failed");
    }

    const newVideo = Video({
        videoFile: {
            url: isVideoUploded.url,
            public_id: isVideoUploded.public_id,
        },
        thumbnail: {
            url: isThumbnailUploded.url,
            public_id: isThumbnailUploded.public_id,
        },
        title: title,
        description: description,
        duration: isVideoUploded.duration,
        owner: req.user._id,
    });

    const video = await Video.create(newVideo);

    if (!video) {
        throw new ApiError(400, "Cant save video in db");
    }

    return res.status(200).json({
        response: new ApiResponse(200, video, "video Uploaded"),
    });
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.query;
    if (!videoId) {
        throw new ApiError(401, "video id is missing");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(401, "Video with video id doesnt exist");
    }
    if (req.user && req.user._id) {
        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { watchHistory: videoId } },
            { new: true },
        );
    }
    video.views += 1;
    await video.save({ validateBeforeSave: false });
    return res.status(200).json({
        response: new ApiResponse(200, video, "Video link"),
    });
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId, title, description, isPublish } = req.body;
    if (!videoId) {
        throw new ApiError(401, "video id is missing");
    }
    const video = await Video.findById(videoId);
    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(401, "you dont have permission to update this");
    }
    if (!video) {
        throw new ApiError(401, "Video with video id doesnt exist");
    }
    if (!title && !description && !req.file.path && !isPublish) {
        return res.status(200).json({
            response: new ApiResponse(200, {}, "Nothing to update"),
        });
    }
    if (title) video.title = title;
    if (description) video.description = description;
    if (isPublish) video.isPublish = isPublish;
    if (req.file.path) {
        const cloudinaryUrl = await uploadOnCloudinary(req.file.path);
        if (!cloudinaryUrl) {
            throw new ApiError(401, "thumbnail upload failed");
        }
        await deleteFromCloudinary(video.thumbnail.public_id);
        video.thumbnail = {
            url: cloudinaryUrl.url,
            public_id: cloudinaryUrl.public_id,
        };
    }
    await video.save({ validateBeforeSave: false });
    return res.status(200).json({
        response: new ApiResponse(200, video, "Video updated successfully"),
    });
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.query;
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(
            403,
            "You do not have permission to delete this video",
        );
    }
    await deleteFromCloudinary(video.thumbnail.public_id);
    await deleteFromCloudinary(video.videoFile.public_id, "video");
    await Video.deleteOne({ _id: videoId });
    res.status(200).json({
        success: true,
        message: "Video deleted successfully",
    });
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
};
