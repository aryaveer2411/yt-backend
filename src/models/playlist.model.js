import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
        owner: {
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

playlistSchema.plugin(mongooseAggregatePaginate);

export const Playlist = mongoose.model("Playlist", playlistSchema);
