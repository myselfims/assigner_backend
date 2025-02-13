import { Project } from "../db/project.js";
import { Sprint } from "../db/sprint.js";
import { Task } from "../db/task.js";
import { User } from "../db/user.js";
import { UserProject } from "../db/userProject.js";
import Workspace from "../db/workspace.js";
import { asyncMiddleware } from "../middlewares/async.js";

// Create a new sprint
export const createSprint = asyncMiddleware(async (req, res) => {
  try {
    const { projectId, title, description, startDate, endDate } = req.body;
    const sprint = await Sprint.create({
      projectId,
      title,
      description,
      startDate,
      endDate,
    });
    res.status(201).json(sprint);
  } catch (error) {
    res.status(500).json({ error: "Failed to create sprint" });
  }
});

// Get all sprints for a project
export const getSprintsByProject = asyncMiddleware(async (req, res) => {
  try {
    const { projectId } = req.params;
    const sprints = await Sprint.findAll({ where: { projectId } });
    res.status(200).json(sprints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sprints" });
  }
});

// Update a sprint
export const updateSprint = asyncMiddleware(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const sprint = await Sprint.update(updates, { where: { id } });
    res.status(200).json(sprint);
  } catch (error) {
    res.status(500).json({ error: "Failed to update sprint" });
  }
});

// Delete a sprint
export const deleteSprint = asyncMiddleware(async (req, res) => {
  try {
    const { id } = req.params;
    await Sprint.destroy({ where: { id } });
    res.status(200).json({ message: "Sprint deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete sprint" });
  }
});

export const getSprintTasks = asyncMiddleware(async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the sprint and validate its existence
    const sprint = await Sprint.findByPk(id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    // Fetch the project details including workspace info
    const project = await Project.findByPk(sprint.projectId, {
      include: [{ model: Workspace, as: "workspace" }],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the user is the workspace creator
    const whereCondition = { sprintId: id };
    if (project.workspace.createdBy === req.user.id) {
      // Creator has full access, no need to check UserProject
    } else {
      // Check user permissions in the UserProject table
      const permission = await UserProject.findOne({
        where: { userId: req.user.id, projectId: sprint.projectId },
      });

      // If no permission found, deny access
      if (!permission) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      if (permission?.roleId !== 1 && permission?.roleId !== 4) {
        whereCondition.assignedToId = req.user.id;
      }
    }

    // Fetch tasks based on role

    // Fetch tasks
    const tasks = await Task.findAll({
      where: whereCondition,
      order: [["index", "ASC"]],
      include: [
        {
          model: User,
          as: "assignedBy",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "assignedTo",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "An error occurred while fetching tasks",
        error: error.message,
      });
  }
});
