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
    const userId = socket.handshake.query.userId;
    const workspaceId = socket.handshake.query.workspaceId;

    if (userId) {
      socket.join(`socket-${userId}`);
      console.log(`User ${userId} joined socket automatically`);
    }

    if (workspaceId) {
      console.log('query',socket.handshake.query)
      socket.join(`workspace-${workspaceId}`);
      console.log(`User ${userId} - ${workspaceId} joined workspace automatically`);
      io
        .to(`workspace-${workspaceId}`)
        .emit("user:online", { userId, status: "online" });
    }

    socket.on("leave:workspace", (data)=>{
      console.log("leaving workspace", data)
      io
      .to(`workspace-${data.workspaceId}`)
      .emit("user:offline", { userId : data.userId, status: "offline" });
    })

    // handleCommentSocket(io, socket);
    handleChatSocket(socket);
    handleNotificationSocket(socket); // Initialize notifications

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
