import { Server } from "socket.io";
import handleCommentSocket from "./comment.js";
import handleChatSocket from "./chat.js";
import handleNotificationSocket from "./notification.js"; // Import notification socket
import handleWorkspaceSocket from "./workspace.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    const userId = socket.handshake.query.userId;

    if (userId) {
      socket.join(`socket-${userId}`);
      console.log(`User ${userId} joined socket automatically`);
    }

   

    handleWorkspaceSocket(io, socket)
    // handleCommentSocket(io, socket);
    handleChatSocket(socket);
    handleNotificationSocket(socket); // Initialize notifications

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
