import { Sprint } from "../db/sprint.js";
import { Task } from "../db/task.js";
import { User } from "../db/user.js";
import { asyncMiddleware } from "../middlewares/async.js";

// Create a new sprint
export const createSprint = asyncMiddleware(async (req, res) => {
  try {
    const { projectId, title, description, startDate, endDate } = req.body;
    const sprint = await Sprint.create({ projectId, title, description, startDate, endDate });
    res.status(201).json(sprint);
  } catch (error) {
    res.status(500).json({ error: "Failed to create sprint" });
  }
});

// Get all sprints for a project
export const getSprintsByProject = asyncMiddleware( async (req, res) => {
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
    const tasks = await Task.findAll({
      where: { sprintId: id },
      order: [["index", "ASC"]],
      include: [
        {
          model: User,
          as: "assignedBy", // Matches the alias defined in the association
          attributes: ["id", "name"], // Only fetch `id` and `name` from the User table
        },
        {
          model: User,
          as: "assignedTo", // Matches the alias defined in the association
          attributes: ["id", "name"], // Only fetch `id` and `name` from the User table
        },
      ],
    });
    

    // Check if tasks were found
    if (!tasks.length) {
      return res.status(404).json({ message: 'No tasks found for this sprint' });
    }

    res.status(200).json(tasks); // Send tasks in the response
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ message: 'An error occurred while fetching tasks', error: error.message });
  }
});

