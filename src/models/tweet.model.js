import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
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

tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Tweet", tweetSchema);
