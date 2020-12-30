import express from "express";
import { body } from "express-validator";

const router = express.Router();

import auth from "./middleware/auth";

import { register, login, allUsers } from "./controllers/user.controller";
import {
  chats,
  messages,
  newChat,
  seen,
  sendMessage,
} from "./controllers/chat.controller";

router.post("/login", login);

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("username").isLength({ min: 4, max: 20 }),
    body("bio").isLength({ min: 4, max: 30 }),
  ],
  register
);

router.get("/users", auth, allUsers);

router.post("/newchat/:username", auth, newChat);

router.get("/messages/:username", auth, messages);

router.get("/chats", auth, chats);

router.post("/seen/:username", auth, seen);

router.post("/sendmessage/:username", auth, sendMessage);

router.get("/verify", auth, (_: any, res: any) => {
  res.status(200).json("User authenticated");
});

export default router;
