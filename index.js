import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { initializeSocket } from "./socket/socket.js";
import user from "./routes/user.js";
import login from "./routes/login.js";
import tasks from "./routes/tasks.js";
import comment from "./routes/comment.js";
import otp from "./routes/otp.js";
import projects from "./routes/projects.js";
import sprint from "./routes/sprint.js";
import organization from "./routes/organization.js";
import notifications from "./routes/notifications.js";
import global from "./routes/global.js";
import chat from "./routes/chat.js";
import "./db/models.js"; // Ensure database models are initialized

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Create HTTP Server and Attach Socket.io
const server = createServer(app);
const io = initializeSocket(server); // Pass HTTP server to initializeSocket

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;  // Attach the socket.io instance to the request object
  next();
});

// API Routes
app.use("/api/users", user);
app.use("/api/login", login);
app.use("/api/projects", projects);
app.use("/api/sprints", sprint);
app.use("/api/organizations", organization);
app.use("/api/tasks", tasks);
app.use("/api/comments", comment);
app.use("/api/otp", otp);
app.use("/api/notifications", notifications);
app.use("/api/global", global);
app.use("/api/chat", chat);

const PORT = process.env.PORT || 3000;

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
