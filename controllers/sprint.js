import { Sprint } from "../db/models.js";

// Create a new sprint
export const createSprint = async (req, res) => {
  try {
    const { projectId, title, description, startDate, endDate } = req.body;
    const sprint = await Sprint.create({ projectId, title, description, startDate, endDate });
    res.status(201).json(sprint);
  } catch (error) {
    res.status(500).json({ error: "Failed to create sprint" });
  }
};

// Get all sprints for a project
export const getSprintsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const sprints = await Sprint.findAll({ where: { projectId } });
    res.status(200).json(sprints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sprints" });
  }
};

// Update a sprint
export const updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const sprint = await Sprint.update(updates, { where: { id } });
    res.status(200).json(sprint);
  } catch (error) {
    res.status(500).json({ error: "Failed to update sprint" });
  }
};

// Delete a sprint
export const deleteSprint = async (req, res) => {
  try {
    const { id } = req.params;
    await Sprint.destroy({ where: { id } });
    res.status(200).json({ message: "Sprint deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete sprint" });
  }
};
