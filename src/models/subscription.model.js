import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

}, {
    timestamps: true, 
    toJSON: {
        transform: (doc, ret) => {
            ret.createdAt = Math.floor(new Date(ret.createdAt).getTime() / 1000); // Convert to epoch (seconds)
            ret.updatedAt = Math.floor(new Date(ret.updatedAt).getTime() / 1000); // Convert to epoch (seconds)
            return ret;
        },
    },
});


export const Subscription = mongoose.model("Subscription", subscriptionSchema);