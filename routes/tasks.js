import express from "express";
import auth from "../middlewares/auth.js";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  update,
  updateFull,
  getActivityLogs
} from "../controllers/tasks.js";

const router = express.Router();



router.get("/:projectId", auth(), getAllTasks).post("/", auth(true), createTask);

router
  .get("/:id", auth(true), getTask)
  .get("/:taskId/activity-logs", auth(true), getActivityLogs)

  .delete("/:id", auth(true), deleteTask)

  .put("/:id", auth(true), updateFull)

  .patch("/:id", auth(true), update);




export default router;
