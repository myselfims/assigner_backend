import express from "express";
import auth from "../middlewares/auth.js";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  update,
  updateFull,
} from "../controllers/tasks.js";

const router = express.Router();



router.get("/", auth(), getAllTasks).post("/", auth(true), createTask);

router
  .get("/:id", auth(true), getTask)

  .delete("/:id", auth(true), deleteTask)

  .put("/:id", auth(true), updateFull)

  .patch("/:id", auth(true), update);




export default router;
