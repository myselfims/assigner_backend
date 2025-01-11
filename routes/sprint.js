import express from "express";
import {
  createSprint,
  getSprintsByProject,
  updateSprint,
  deleteSprint,
  getSprintTasks
} from "../controllers/sprint.js";

const router = express.Router();

// Sprint-related routes
router.post("/", createSprint); // Create a new sprint
router.get("/project/:projectId", getSprintsByProject); // Get all sprints for a project
router.put("/:id", updateSprint); // Update a sprint by ID
router.delete("/:id", deleteSprint); // Delete a sprint by ID
router.get("/:id/tasks/", getSprintTasks); // Delete a sprint by ID

export default router;
