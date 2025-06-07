import mongoose from "mongoose"; 
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;
    const { page = 1, limit = 10 } = req.query;
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username profilePicture")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    const totalComments = await Comment.countDocuments({ video: videoId });
    const totalPages = Math.ceil(totalComments / limit);
    return res.status(200).json({
        response: new ApiResponse(200, {
            comments,
            totalComments,
            totalPages,
            currentPage: Number(page),
        }, "Comments retrieved successfully"),
    });
});

const addComment = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;
    const { content } = req.body;
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }
    const comment = new Comment({
        content,
        video: videoId,
        owner: req.user._id,
    });
    await comment.save();
    await comment.populate("owner", "username profilePicture");
    return res.status(201).json({
        response: new ApiResponse(201, comment, "Comment added successfully"),
    });
});

const updateComment = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId;
    const { content } = req.body;
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this comment");
    }
    comment.content = content;
    await comment.save();
    return res.status(200).json({
        response: new ApiResponse(200, comment, "Comment updated successfully"),
    });
});

const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId;
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this comment");
    }
    await comment.deleteOne();
    return res.status(200).json({
        response: new ApiResponse(200, null, "Comment deleted successfully"),
    });
});

export { getVideoComments, addComment, updateComment, deleteComment };
