const commentsSocket = (io) => {
      console.log(`Comment socket connected: ${socket.id}`);
  
      // Join a task comment room
      socket.on("join:comment", (taskId) => {
        socket.join(`task-${taskId}`);
        console.log(`User joined task room: task-${taskId}`);
      });
  
      // Handle new comment
      socket.on("comment", (data) => {
        const { taskId, comment, userId } = data;
  
        if (!taskId || !comment || !userId) {
          console.error("Invalid comment data received.");
          return;
        }
  
        const commentData = {
          comment,
          userId,
          taskId,
          timestamp: new Date(),
        };
  
        // Emit the comment to users in the task room
        io.to(`task-${taskId}`).emit("comment", commentData);
        console.log(`Comment sent in task-${taskId} by user ${userId}: ${comment}`);
      });
  
      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`Comment socket disconnected: ${socket.id}`);
      });

  };
  
  export default commentsSocket;
  