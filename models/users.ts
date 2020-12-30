import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
  email: string;
  password: string;
  username: string;
  bio: string;
  profilepic: string;
  updated_at: string;
  online: boolean;
}

const UserSchema: Schema = new Schema(
  {
    _id: mongoose.Types.ObjectId,
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, maxlength: 20 },
    password: { type: String, required: true },
    bio: { type: String, required: false },
    profilepic: { type: String, required: true },
    online: { type: Boolean, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model<IUser & Document>("User", UserSchema);
