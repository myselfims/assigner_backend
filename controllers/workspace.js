import Joi from "joi";
import { User } from "../db/user.js";
import { Workspace } from "../db/workspace.js";
import { asyncMiddleware } from "../middlewares/async.js";
import { UserWorkspace } from "../db/userWorkspace.js";
import { Project } from "../db/project.js";
import { UserProject } from "../db/userProject.js";
import { Role } from "../db/roleAndDesignation.js";
import ActivityLog from "../db/activityLog.js";
import { generateLogContent } from "../config/activityMessages.js";

export const createWorkspace = asyncMiddleware(async (req, res) => {
  // Validation schema
  const schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid("personal", "team", "organization").required(),
    description: Joi.string().allow(""),
  });

  // Validate request body
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if user exists
  const user = await User.findOne({ where: { id: req.user.id } });
  if (!user) return res.status(400).send("User not found!");

  // Create the workspace
  const workspace = await Workspace.create({
    name: req.body.name,
    type: req.body.type,
    description: req.body.description,
    createdBy: req.user.id,
  });

  let log = generateLogContent("newWorkspaceCreated", {
    workspaceName: value.name,
    createrName: req.user.name,
  });

  ActivityLog.create({
    ...log,
    entityId: workspace.id,
    workspaceId: workspace.id,
    userId: req.user.id,
  });

  const role = await Role.findOne({ where: { name: "Owner" } });

  if (!role) {
    throw new Error("Owner role not found");
  }

  UserWorkspace.create({
    workspaceId: workspace.id,
    userId: req.user.id,
    roleId: role.id,
    status: "active",
  });

  res.status(201).json({
    message: "Workspace created successfully.",
    workspace,
  });
});

export const getWorkspaces = asyncMiddleware(async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch workspaces created by the user
    const createdWorkspaces = await Workspace.findAll({
      where: { createdBy: userId },
      include: {
        model: User,
        as: "owner", // Now correctly references the owner of the workspace
        attributes: ["id", "name", "email"],
      },
    });

    // Fetch workspaces where the user is assigned
    const assignedWorkspaces = await UserWorkspace.findAll({
      where: { userId: userId },
      include: {
        model: Workspace,
        as: "workspace", // Matches the alias in belongsToMany
      },
    });

    // Respond with the combined workspaces
    res.status(200).json(assignedWorkspaces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export const getProjects = asyncMiddleware(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const createdProjects = await Project.findAll({
      where: { createdBy: userId, workspaceId: workspaceId },
      include: {
        model: User,
        as: "leadUser", // Fetch the lead details
        attributes: ["id", "name", "email"], // Only select necessary fields
      },
    });
    const assignedProjects = await UserProject.findAll({
      where: { userId },
      include: {
        model: Project,
        where: { workspaceId },
        as: "project",
      },
    });

    if (!createdProjects) {
      return res
        .status(404)
        .json({ message: "No projects found for this user." });
    }

    console.log(createdProjects);

    // Helper function to get team size for a project
    const getTeamSize = async (projectId) => {
      // Get the number of users assigned to this project from the UserProject table
      const teamCount = await UserProject.count({ where: { projectId } });
      return teamCount; // This will be the team size
    };

    // Combine created and assigned projects
    const projects = [
      ...createdProjects.map(async (project) => {
        const teamSize = await getTeamSize(project.id);
        return {
          ...project.toJSON(), // Converts sequelize model to plain object
          role: "Created by You",
          teamSize: teamSize + 1, // Add 1 for the creator
        };
      }),
      ...assignedProjects.map(async ({ project }) => {
        const teamSize = await getTeamSize(project.id);
        return {
          ...project.toJSON(),
          role: "Assigned to You",
          teamSize: teamSize,
        };
      }),
    ];

    // Wait for all async operations to complete
    const resolvedProjects = await Promise.all(projects);

    // Respond with the combined projects
    res.status(200).json(resolvedProjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export const getUsers = asyncMiddleware(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const workspaceUsers = await UserWorkspace.findAll({
      where: { workspaceId: workspaceId },
      include: [
        {
          model: User,
          as: "user", // Fetch the lead details
          attributes: ["id", "name", "email"], // Only select necessary fields
        },
        {
          model: Role,
          as: "role",
        },
      ],
    });

    if (!workspaceUsers) {
      return res
        .status(404)
        .json({ message: "No users found for this workspace." });
    }

    console.log(workspaceUsers);

    // Respond with the combined projects
    res.status(200).json({ workspaceUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export const getActivityLogs = asyncMiddleware(async (req, res) => {
  try {
    let { workspaceId } = req.params;
    let logs = await ActivityLog.findAll({ where: { workspaceId }, 
      include: [
        {
          model: User,
          as: "user", // Fetch the lead details
          attributes: ["id", "name", "email"], // Only select necessary fields
        }]
    });
    // Respond with the combined projects
    console.log("logs are : ", logs);
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
