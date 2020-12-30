import User from "../models/users";
import Chats from "../models/chats";
import Message from "../models/messages";

import mongoose from "mongoose";

export const chats = async (req: any, res: any, next: any) => {
  const user = await User.findOne({ email: req.email });

  if (!user) {
    const error: any = new Error("User not found.");
    error.code = 404;
    return next(error);
  }

  const chats = await Chats.find({ userId: user._id }, null, {
    sort: { time: -1 },
  });
  let friends = [];

  for (let chat of chats) {
    const user = await User.findOne({ _id: chat.friendId });
    const data: Friend = {
      username: user?.username || "",
      lastmessage: chat.lastmessage,
      profilepic: user?.profilepic || "",
      seen: chat.seen,
      chatId: chat.chatId,
      online: user?.online ? "Online" : user?.updated_at || "",
    };

    friends.push(data);
  }

  const data: Data = {
    friends,
    profilepic: user.profilepic,
    username: user.username,
    bio: user.bio,
  };
  res.status(200).json(data);
};

type Friend = {
  username: string;
  profilepic: string;
  lastmessage: string;
  seen: boolean;
  chatId: string;
  online: string;
};

type Data = {
  friends: Friend[];
  profilepic: string;
  username: string;
  bio: string | null;
};

export const sendMessage = async (req: any, res: any, next: any) => {
  const user = await User.findOne({ email: req.email });

  if (!user) {
    const error: any = new Error("User not found.");
    error.code = 404;
    return next(error);
  }

  const message: string = req.body.message;

  if (!message) {
    const error: any = new Error("Invalid input.");
    error.code = 422;
    return next(error);
  }
  const username: string = req.params.username;

  if (username === user.username) {
    const error: any = new Error("Not authorized.");
    error.code = 401;
    return next(error);
  }

  let friend = await User.findOne({ username });

  if (!friend) {
    const error: any = new Error("Friend not found.");
    error.code = 404;
    return next(error);
  }

  const chatId = friend._id + user._id;

  const chat = await Chats.findOne({
    $or: [{ chatId }, { chatId: user._id + friend._id }],
  });

  if (!chat) {
    const error: any = new Error("Chat not found.");
    error.code = 404;
    return next(error);
  }

  await Message.create({
    _id: mongoose.Types.ObjectId(),
    message,
    chatId: chat.chatId,
    sentBy: user._id,
  });

  await Chats.updateMany(
    { chatId: chat.chatId },
    { $set: { lastmessage: message, time: new Date(), seen: false } }
  );

  res.status(201).json("Message sent successfully");
};

export const messages = async (req: any, res: any, next: any) => {
  const user = await User.findOne({ email: req.email });

  if (!user) {
    const error: any = new Error("User not found.");
    error.code = 404;
    return next(error);
  }
  const { username }: { username: string } = req.params;

  if (username === user.username) {
    const error: any = new Error("Not authorized.");
    error.code = 401;
    return next(error);
  }

  let friend = await User.findOne({ username });

  if (!friend) {
    const error: any = new Error("Friend not found.");
    error.code = 404;
    return next(error);
  }

  const chatId: string = friend?._id + user._id;

  const chat = await Chats.findOne({
    $or: [{ chatId }, { chatId: user._id + friend._id }],
  });

  if (!chat) {
    const error: any = new Error("Chat not found.");
    error.code = 404;
    return next(error);
  }

  const messages = await Message.find({ chatId: chat.chatId });

  const msgs: Message[] = [];

  for (let i in messages) {
    const message = messages[i];
    const data: Message = {
      message: message.message,
      sentBy: user.username,
      //@ts-ignore
      time: message.created_at,
    };
    if (message.sentBy.toString() !== user.id) {
      data.sentBy = friend.username;
    }
    msgs.push(data);
  }

  res.status(200).json(msgs);
};
type Message = {
  message: string;
  sentBy: string;
  time: string;
};
export const newChat = async (req: any, res: any, next: any) => {
  const user = await User.findOne({ email: req.email });

  if (!user) {
    const error: any = new Error("User not found.");
    error.code = 404;
    return next(error);
  }
  const { username }: { username: string } = req.params;

  if (username === user.username) {
    const error: any = new Error("Not authorized.");
    error.code = 401;
    return next(error);
  }

  let friend = await User.findOne({ username });

  if (!friend) {
    const error: any = new Error("Friend not found.");
    error.code = 404;
    return next(error);
  }

  const chatId = friend?._id + user._id;

  const chat = await Chats.findOne({
    $or: [{ chatId }, { chatId: user._id + friend._id }],
  });

  if (chat) {
    return res.status(200).json(chat.chatId);
  }
  await Chats.insertMany([
    {
      _id: mongoose.Types.ObjectId(),
      lastmessage: "",
      chatId,
      friendId: user._id,
      userId: friend._id,
      time: new Date(),
      seen: true,
    },
    {
      _id: mongoose.Types.ObjectId(),
      lastmessage: "",
      chatId,
      friendId: friend?._id,
      userId: user._id,
      time: new Date(),
      seen: true,
    },
  ]);

  res.status(201).json(chatId);
};

export const seen = async (req: any, res: any, next: any) => {
  const user = await User.findOne({ email: req.email });

  if (!user) {
    const error: any = new Error("User not found.");
    error.code = 404;
    return next(error);
  }
  const username: string = req.params.username;

  if (username === user.username) {
    const error: any = new Error("Not authorized.");
    error.code = 401;
    return next(error);
  }

  let friend = await User.findOne({ username });

  if (!friend) {
    const error: any = new Error("Friend not found.");
    error.code = 404;
    return next(error);
  }

  const chat = await Chats.findOne({
    userId: user.id,
    friendId: friend.id,
  });
  await Chats.updateMany({ _id: chat?._id }, { $set: { seen: true } });

  res.send("Friend clicked");
};
