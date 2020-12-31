import User, { IUser } from "../models/users";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { uploadImage } from "../gcloud";

export const login: any = async (req: any, res: any, next: any) => {
  const { email, password }: { email: string; password: string } = req.body;

  const user = await User.findOne({
    $or: [{ email }, { username: email }],
  });

  if (!user || !password) {
    const error: any = new Error("Invalid email/username or password.");
    error.code = 422;
    return next(error);
  }

  const isTrue: any = await bcrypt.compare(password, user.password);

  if (!isTrue) {
    const error: any = new Error("Invalid email/username or password.");
    error.code = 422;
    return next(error);
  }

  const userToken = await jwt.sign(
    {
      email: user.email,
    },
    process.env.ACCESS_TOKEN || "",
    { expiresIn: "1d" }
  );

  const socketToken = await jwt.sign(
    {
      username: user.username,
    },
    process.env.SOCKET_TOKEN || "",
    { expiresIn: "1d" }
  );

  res.status(200).json({ userToken, socketToken });
};

export const register = async (req: any, res: any, next: any) => {
  const { password, bio, email, username }: IUser = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty() || !usernameVal(username)) {
    const error: any = new Error("Invalid input.");
    error.code = 422;
    return next(error);
  }

  const newEmail = email.toLowerCase();
  const newUsername = username.toLowerCase();

  const user = await User.findOne({ email: newEmail });

  const usernameExist = await User.findOne({ username: newUsername });

  if (user || usernameExist) {
    const error: any = new Error(
      `${user ? "Email" : "Username"} already exist.`
    );
    error.code = 409;
    return next(error);
  }

  if (!req.files || !req.files.profilepic) {
    const error: any = new Error("No image uploaded.");
    error.code = 422;
    return next(error);
  }

  const profilepic = await uploadImage(req.files.profilepic, "posts/");

  const hashedPassword = await bcrypt.hash(password, 15);

  await User.create({
    _id: mongoose.Types.ObjectId(),
    email: newEmail,
    password: hashedPassword,
    username: newUsername,
    bio,
    //@ts-ignore
    profilepic,
    online: false,
  });
  res.status(201).json("Account created successfully.");
};

export const allUsers = async (req: any, res: any, next: any) => {
  const user = await User.findOne({ email: req.email });

  if (!user) {
    const error: any = new Error("User not found.");
    error.code = 404;
    return next(error);
  }

  const findUsers = await User.find(
    { _id: { $ne: user._id } },
    { _id: 0, username: "", profilepic: "", updated_at: "", online: "" },
    {
      sort: { username: -1 },
    }
  );

  let users: User[] = [];
  for (let user of findUsers) {
    users.push({
      online: user.online ? user.online : user.updated_at,
      profilepic: user.profilepic,
      username: user.username,
    });
  }

  res.status(200).json(users);
};

type User = {
  online: string | boolean;
  profilepic: string;
  username: string;
};

const usernameVal = (str: string) => {
  const accept = "abcdefghijklmnopqrstuvwxyz1234567890.-";
  const check = str.split(" ").length;
  if (check > 1) return false;
  for (let i = 0; i <= str.length - 1; i++) {
    const char = str[i];
    if (i === 0 || i === str.length - 1) {
      if (char === "-" || char === ".") return false;
    }
    if (!accept.includes(char.toLowerCase())) {
      return false;
    }
  }
  return true;
};
