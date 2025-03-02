const handleWorkspaceSocket = (io, socket) => {
    const userId = socket.handshake.query.userId;
    const workspaceId = socket.handshake.query.workspaceId;
  
    if (workspaceId) {
      console.log('query', socket.handshake.query);
      socket.join(`workspace-${workspaceId}`);
      console.log(`User ${userId} - ${workspaceId} joined workspace automatically`);
      io.to(`workspace-${workspaceId}`).emit("user:online", { userId, status: "online" });
    }
  
    socket.on("leave:workspace", (data) => {
      console.log("leaving workspace", data);
      io.to(`workspace-${data.workspaceId}`).emit("user:offline", { userId: data.userId, status: "offline" });
    });
  };
  
  export default handleWorkspaceSocket;


  export function sendActivityLog(io, workspaceId, data) {
    if (workspaceId) {
        console.log('sending socket message to ', workspaceId)
        io.to(`workspace-${workspaceId}`).emit("activityLog", data);
    }
    
  }
  