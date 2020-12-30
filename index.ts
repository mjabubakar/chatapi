import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import Chat from "./models/chats";
import User from "./models/users";
import fileUpload from "express-fileupload";
require("dotenv/config");

import routes from "./routes";

const app: express.Application = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST"],
  allowedHeaders: ["authorization"],
  credentials: true,
};

let http = require("http").Server(app);
export let io = require("socket.io")(http, {
  cors: corsOptions,
});

const port: any = process.env.PORT || 4000;

app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
// app.use(cors(corsOptions));

app.use(routes);

app.use((error: any, req: any, res: any, next: any) => {
  const status = error.code || 500;
  const message = error.message || "Server error occured.";
  res.status(status).json({ message });
});

app.set("io", io);
const jwt = require("jsonwebtoken");

type Message = {
  username: string;
  message: string;
  chatId: string;
  time: string;
  profilepic: string;
};
io.use((socket: any, next: any) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      process.env.SOCKET_TOKEN,
      function (err: any, decodedToken: any) {
        if (err || !decodedToken) {
          const error: any = new Error("Authentication error.");
          error.code = 403;
          next(error);
        }
        socket.username = decodedToken.username;
        next();
      }
    );
  } else {
    const error: any = new Error("Authentication error.");
    error.code = 403;
    next(error);
  }
});

io.on("connection", async (socket: any) => {
  const username = socket.username;
  let user: any;
  const rooms: string[] = [];

  try {
    user = await User.findOneAndUpdate({ username }, { online: true });
    const chats = await Chat.find({ userId: user?._id }).select({
      chatId: 1,
      _id: 0,
    });
    chats.map((item) => {
      rooms.push(item.chatId);
    });
    socket.join(user.username);
    socket.join(rooms);

    setTimeout(() => {
      rooms.forEach((room: string) => {
        socket.to(room).emit("online", {
          username: user.username,
        });
      });
    }, 5000);
  } catch (e) {
    throw Error("An error occured. Please try again later");
  }

  socket.on(
    "typing",
    ({
      chatId,
      IsTyping,
      username,
    }: {
      chatId: string;
      IsTyping: boolean;
      username: string;
    }) => {
      socket.to(chatId).emit("istyping", {
        IsTyping,
        username,
      });
    }
  );

  socket.on("joinchat", ({ chatId }: { chatId: string }) => {
    socket.join(chatId);
  });

  socket.on(
    "join",
    ({ chatId, username }: { chatId: string; username: string }) => {
      socket.join(chatId);
      socket.to(username).emit("joinchat", {
        chatId,
      });
    }
  );

  socket.on("sendmessage", (data: Message) => {
    const { message, username, chatId, time, profilepic } = data;
    socket.to(chatId).emit("message", {
      message,
      username,
      sentBy: user.username,
      time,
      profilepic,
    });
  });
  socket.on("disconnect", async () => {
    const user = await User.findOneAndUpdate({ username }, { online: false });

    rooms.forEach((room: string) => {
      socket.to(room).emit("offline", {
        time: user?.updated_at,
        username: user?.username,
      });
    });
  });
});
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);
mongoose
  //@ts-ignore
  .connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    http.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(() => {
    throw new Error("Server error");
  });
