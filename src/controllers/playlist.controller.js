import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user._id;
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }
    const playlist = new Playlist({
        name,
        description,
        videos: [],
        owner: userId,
    });
    const createdPlaylist = await playlist.save();
    if (!createdPlaylist) {
        throw new ApiError(500, "Failed to create playlist");
    }
    return res.status(201).json({
        response: new ApiResponse(201, createdPlaylist, "Playlist created successfully"),
    });
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const playlists = await Playlist.find({ owner: userId }).populate("videos");
    if (!playlists) {
        return res.status(404).json({
            response: new ApiResponse(404, null, "No playlists found for this user"),
        });
    }
    return res.status(200).json({
        response: new ApiResponse(200, playlists, "User playlists fetched successfully"),
    });
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findById(playlistId).populate("videos");
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).json({
        response: new ApiResponse(200, playlist, "Playlist fetched successfully"),
    });
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (playlist.videos.includes(videoId)) {
        return res.status(400).json({
            response: new ApiResponse(400, null, "Video already exists in the playlist"),
        });
    }
    playlist.videos.push(videoId);
    const updatedPlaylist = await playlist.save();
    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to add video to playlist");
    }
    return res.status(200).json({
        response: new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"),
    });
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!playlist.videos.includes(videoId)) {
        return res.status(400).json({
            response: new ApiResponse(400, null, "Video not found in the playlist"),
        });
    }
    playlist.videos = playlist.videos.filter((vid) => vid.toString() !== videoId);
    const updatedPlaylist = await playlist.save();
    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to remove video from playlist");
    }
    return res.status(200).json({
        response: new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"),
    });
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).json({
        response: new ApiResponse(200, null, "Playlist deleted successfully"),
    });
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true }
    );
    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).json({
        response: new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"),
    });
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
