import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import envConfig from "./config/envConfig.js";
import authRoutes from "../server/routes/userRoutes.js";
import messageRoutes from "../server/routes/messageRoutes.js";
import { Server } from "socket.io";

dotenv.config();

mongoose
  .connect(envConfig.db.URL)
  .then(() => {
    console.log("Mongoose connected");
  })
  .catch((err) => {
    console.log("MongoDB connection error", err);
  });

const PORT = process.env.PORT || 4800;

//Create express app and HTTP server
const app = express();
const server = http.createServer(app);

//Initialze socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
});

// Store online users
export const userSocketMap = {}; //{userId: socketId}

//Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  //Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

//Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
  console.log("Server is running on PORT", PORT);
});
