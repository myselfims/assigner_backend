import { Server } from "socket.io";
import { Comment,User } from "../db/models.js";
import { schema } from "../controllers/comments.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join:comment", (data) => {
      socket.join(data);
      console.log(data);
    });
    socket.on("comment", async (data) => {
      console.log("user", data);
      const {error} = schema.validate(data)
      if (error) return null ;
      let comment = await Comment.create({
        comment: data.comment,
        taskId: data.task,
        userId: data.user
      });
      let user = await User.findByPk(data.user);
      comment.userId = user.name;
      socket.to(data.task).emit("comment", comment);
    });
  });

  return io;
};
