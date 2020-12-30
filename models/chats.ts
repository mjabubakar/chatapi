import mongoose, { Schema, Document } from "mongoose";

export interface IChat {
  chatId: string;
  friendId: string;
  lastmessage: string;
  updated_at: string;
  userId: string;
  time: Date;
  seen: boolean;
}

const Chat: Schema = new Schema(
  {
    _id: mongoose.Types.ObjectId,
    chatId: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friendId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastmessage: String,
    time: {
      required: true,
      type: Date,
    },
    seen: {
      required: true,
      type: Boolean,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model<IChat & Document>("Chat", Chat);
