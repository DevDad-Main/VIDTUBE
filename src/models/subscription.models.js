import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // NOTE: The one who is subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // NOTE: The one who the 'Subscriber is subscribing to'
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
