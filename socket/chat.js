


const chatSocket = (io) => {
    io.on("connection", (socket) => {
      console.log(`Chat socket connected: ${socket.id}`);
  
      // User joins a chat room
      socket.on("join:chat", (uniqueId) => {
        if (!uniqueId) return;
        socket.join(`chat-${uniqueId}`);
        console.log(`User ${uniqueId} joined chat`);
  
        // Notify others that the user is online
        io.emit("user:online", { uniqueId, status: "online" });
      });
  
      // Handle sending a message
      socket.on("send:message", (message) => {
        const { content, senderId, receiverId, projectId } = message;
        console.log('message got', message)
        if (!content || !senderId) {
          console.error("Invalid message data received.");
          return;
        }
  
        const messageData = {
          content,
          senderId,
          projectId,
          receiverId,
          timestamp: new Date(),
        };
  
        // Send to project chat room
        if (projectId) {
          io.to(`chat-${projectId}`).emit("message", messageData);
        }
        // Send direct message to specific user
        else if (receiverId) {
          io.to(`chat-${receiverId}`).emit("message", messageData);
        }
  
        console.log(`Message from ${senderId}: ${content}`);
      });
  
      // Handle typing status
      socket.on("typing", (data) => {
        console.log('typing recieved')
        const { name, projectId, receiverId } = data;
  
        if (projectId) {
          io.to(`chat-${projectId}`).emit("typing", name);
        } else if (receiverId) {
          io.to(`chat-${receiverId}`).emit("typing", name);
        }
      });
  
      // Handle user disconnect
      socket.on("disconnect", () => {
        console.log(`Chat socket disconnected: ${socket.id}`);
  
        // Optionally, track and emit offline status
        io.emit("user:offline", { uniqueId: socket.id, status: "offline" });
      });
    });
  };
  
  export default chatSocket;
  