import Joi from "joi";
import { User } from "../db/user.js";
import { Workspace } from "../db/workspace.js";
import { asyncMiddleware } from "../middlewares/async.js";
import { UserWorkspace } from "../db/userWorkspace.js";
import { Project } from "../db/project.js";
import { UserProject } from "../db/userProject.js";
import { Role } from "../db/roleAndDesignation.js";
import ActivityLog from "../db/activityLog.js";
import { createActivityLog } from "../services/activityLogService.js";
import bcrypt from "bcrypt";
import { Request } from "../db/request.js";
import { createNotification } from "../services/notificationService.js";

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
        attributes: ["id", "name", "email", "avatar"], // Only select necessary fields
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
          attributes: ["id", "name", "email", "avatar"], // Only select necessary fields
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

export const updateMember = asyncMiddleware(async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    const { roleId } = req.body;

    // Fetch user projects and include the associated user object
    const userWorkspace = await UserWorkspace.findOne({
      where: { workspaceId, userId },
    });

    if (!userWorkspace) {
      return res
        .status(404)
        .json({ message: "User has not associated to the workspace!" });
    }

    userWorkspace.status = "active";
    userWorkspace.roleId = parseInt(roleId);
    userWorkspace.save();

    res.status(200).json(userWorkspace);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching team members" });
  }
});

export const getActivityLogs = asyncMiddleware(async (req, res) => {
  try {
    let { workspaceId } = req.params;
    let logs = await ActivityLog.findAll({
      where: { workspaceId },
      include: [
        {
          model: User,
          as: "user", // Fetch the lead details
          attributes: ["id", "name", "email", "avatar"], // Only select necessary fields
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    // Respond with the combined projects
    console.log("logs are : ", logs);
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export const getUserRole = asyncMiddleware(async (req, res) => {
  try {
    let userId = req.user.id;
    let { workspaceId } = req.params;
    console.log("fetching user role");
    let role = await UserWorkspace.findOne({
      where: { userId, workspaceId },
      include: {
        model: Role,
        as: "role",
      },
    });

    if (!role) {
      console.log("user has no role");
      return res
        .status(404)
        .json({ message: "User has no role for this workspace " });
    }
    console.log("user has role", role);
    res.status(200).json(role);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export const updateWorkspace = asyncMiddleware(async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findOne({ where: { id: workspaceId } });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    Object.keys(req.body).forEach((key) => {
      if (workspace[key] !== undefined) {
        workspace[key] = req.body[key];
      }
    });

    await workspace.save();

    createActivityLog(
      "workspaceUpdated",
      {
        userId: req.user.id,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        editorName: req.user.name,
        entityId: workspace.id,
        entityType: "workspace",
      },
      req.io
    );

    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const transferOwnership = asyncMiddleware(async (req, res) => {
  try {
    let { name, email, message } = req.body;
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).send("Workspace not found");
    }

    const requestMessage = `${req.user.name} wants to transfer the ownership of the workspace '${workspace.name}' to you.`;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      let hashedPassword = await bcrypt.hash("asdfasdf", 10);
      user = await User.create({
        name,
        email,
        password: hashedPassword, 
      });
      // let template = generateEmailContent("invitationExistingUserTemplate", {
      //   projectName: project.name,
      //   invitationLink: "https://easyassigns.com/",
      // });
      // sendEmail(user.email, template.subject, template.body);
    }

    if (message) {
      message = { requesterMessage: message };
    }

    const request = await Request.create({
      type: "Ownership Transfer",
      requesterId: req.user.id,
      targetUserId: user.id,
      workspaceId,
      message: requestMessage,
      metadata: message,
    });

    createNotification(user.id, 'transferWorkspaceOwnership', {workspaceName : workspace.name, requesterName : req.user.name}, req.io)

    return res.status(201).json(request);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

export const getTransferRequest = asyncMiddleware(async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const request = await Request.findOne({ where: { workspaceId, type : 'Ownership Transfer', status: "pending" },
      include : {
        model : User,
        as : 'target'
      }
    });
    if (!request) {
      return res.status(404).send("Transfer request not found");
    }

    return res.status(201).json( request);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});
