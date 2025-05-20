import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

    const videoToUpload = req.files.videoToUpload[0];
    const thumbnail = req.files.thumbnail[0];

    if (!(videoToUpload && thumbnail)) {
        throw new ApiError(400, "Both video and thumbnail is required");
    }

    if (!(videoToUpload.path && thumbnail.path)) {
        throw new ApiError(
            400,
            "Path is missing for either  thumbnail or video",
        );
    }

    const isVideoUploded = await uploadOnCloudinary(videoToUpload.path);

    const isThumbnailUploded = await uploadOnCloudinary(thumbnail.path);

    if (!(isVideoUploded && isThumbnailUploded)) {
        throw new ApiError(400, "Cloudinary upload failed");
    }

    console.log(isVideoUploded, "isVideoUploded");
    console.log(isThumbnailUploded, "isThumbnailUploded");

    const newVideo = Video({
        videoFile: isVideoUploded.url,
        thumbnail: isThumbnailUploded.url,
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

    // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
