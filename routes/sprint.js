import express from "express";
import {
  createSprint,
  getSprintsByProject,
  updateSprint,
  deleteSprint,
  getSprintTasks
} from "../controllers/sprint.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Sprint-related routes
router.post("/", auth(), createSprint); // Create a new sprint
router.get("/project/:projectId", auth(), getSprintsByProject); // Get all sprints for a project
router.patch("/:id", updateSprint); // Partial Update a sprint by ID
router.delete("/:id", deleteSprint); // Delete a sprint by ID
router.get("/:id/tasks/", auth(), getSprintTasks); 
export default router;
