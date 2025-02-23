

const handleNotificationSocket = (socket) => {
    console.log(`Notification socket connected: ${socket.id}`);
  
    // User joins notification room (to receive personal notifications)
    socket.on("join:notifications", (userId) => {
      if (!userId) return;
      socket.join(`notifications-${userId}`);
      console.log(`User ${userId} joined notification room`);
    });
  
    // Emit a new notification
    socket.on("send:notification", ({ userId, title, message, type, priority, redirectUrl }) => {
      if (!userId || !message) {
        console.error("Invalid notification data.");
        return;
      }
  
      const notificationData = {
        title,
        message,
        type: type || "info",
        priority: priority || 3,
        redirectUrl: redirectUrl || null,
        timestamp: new Date(),
      };
  
      // Send notification to the specific user
      io.to(`notifications-${userId}`).emit("notification", notificationData);
      console.log(`Notification sent to User ${userId}: ${message}`);
    });
  
    socket.on("disconnect", () => {
      console.log(`Notification socket disconnected: ${socket.id}`);
    });
  };
  
  export default handleNotificationSocket;

  export function sendNotification(io, userId, notification) {
    if (userId) {
        console.log('sending socket message to ', userId)
        io.to(`notifications-${userId}`).emit("notification", notification);
    }
  }
  