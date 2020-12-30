import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  message: string;
  chatId: string;
  sentBy: string;
}

const Message: Schema = new Schema(
  {
    _id: mongoose.Types.ObjectId,
    message: { type: String, required: true },
    chatId: { type: String, required: true },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model<IMessage & Document>("Message", Message);
