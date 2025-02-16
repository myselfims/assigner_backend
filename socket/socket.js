import { Server } from "socket.io";
import handleCommentSocket from "./comment.js";
import handleChatSocket from "./chat.js";
import handleNotificationSocket from "./notification.js"; // Import notification socket

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    handleCommentSocket(io, socket);
    handleChatSocket(io, socket);
    handleNotificationSocket(io, socket); // Initialize notifications

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
