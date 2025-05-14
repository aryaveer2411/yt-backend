import mongoose, { Schema } from "mongoose";

/*
when counting subscribers on a channel look for objects are availabel with that perticular channel ID

when counting user subscribed channel look how much objects are available with that user ID

example 

obj1 : {channel 1:user1}
obj2 : {channel 1:user2}
obj3 : {channel 1:user3}

here i have 3 object with same channel id and diff user id ie this channel have 3 subscriber

obj1 : {channel 1:user1}
obj2 : {channel 2:user1}
obj3 : {channel 3:user1}

here i have 3 object with diff channel id and same user id ie user subscribe three channel

in the end we count objects which will tell a channel subscribers and user subscribed channels
*/

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        channel: {
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

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
