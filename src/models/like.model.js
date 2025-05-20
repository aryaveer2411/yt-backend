import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            ype: Schema.Types.ObjectId,
            ref: "Video",
        },
        tweet: {
            ype: Schema.Types.ObjectId,
            ref: "Tweet",
        },
        comment: {
            ype: Schema.Types.ObjectId,
            ref: "Comment",
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                ret.createdAt = Math.floor(
                    new Date(ret.createdAt).getTime() / 1000,
                ); // Convert to epoch (seconds)
                ret.updatedAt = Math.floor(
                    new Date(ret.updatedAt).getTime() / 1000,
                ); // Convert to epoch (seconds)
                return ret;
            },
        },
    },
);

export const Like = mongoose.model("Like", likeSchema);
