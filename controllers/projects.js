import Joi from "joi";
import { User } from "../db/user.js";
import { Project } from "../db/project.js";
import { Task } from "../db/task.js";
import { UserProject } from "../db/userProject.js";
import { Status } from "../db/status.js";
import { asyncMiddleware } from "../middlewares/async.js";
import { defaultStatuses } from "../config/globalConfig.js";
import sequelize from "../db/db.js";
import { Role } from "../db/roleAndDesignation.js";
import { generateEmailContent } from "../config/emailTemplates.js";
import { sendEmail } from "../smtp.js";
import { createNotifications } from "../services/notificationService.js";
import { createActivityLog } from "../services/activityLogService.js";
import ActivityLog from "../db/activityLog.js";
import { CalendarEvent } from "../db/calendarEvent.js";
import { Op } from "sequelize";
import { UserWorkspace } from "../db/userWorkspace.js";

export const addProject = asyncMiddleware(async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    lead: Joi.number().required(),
    startDate: Joi.date().required(),
    workspaceId: Joi.number().required(),
    status: Joi.string(),
    priority: Joi.string(),
    budget: Joi.number(),
    deadline: Joi.date(),
    description: Joi.string(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ where: { id: req.body.lead } });
  if (!user) return res.status(400).send("User not found! ");
  let body = req.body;

  const project = await Project.create({
    name: body.name, // or whatever fields you have in your model
    lead: body.lead,
    teamSize: body.teamSize,
    startDate: body.startDate,
    status: body.status,
    budget: body.budget,
    deadline: body.deadline,
    priority: body.priority,
    description: body.description, // Example for a description field
    createdBy: req.user.id,
    workspaceId: body.workspaceId,
    // Add other fields as necessary based on your model
  });
  console.log("Body is ", req.body);
  if (body.lead) {
    console.log("lead is ", body.lead);
    UserProject.create({
      userId: body.lead,
      projectId: project.id,
      roleId: 2,
    });
    createNotifications(
      body.lead,
      "projectLeadAssigned",
      {
        projectName: project.name,
        assignedBy: req.user.name,
        projectId: project.id,
      },
      req.io
    );
  }

  // newProjectCreated
  // New project '{{projectName}}' was created by '{{creatorName}}'
  let log = createActivityLog(
    "newProjectCreated",
    {
      creatorName: req.user.name,
      projectName: project.name,
      userId: req.user.id,
      workspaceId: project.workspaceId,
      entityId: project.id,
      projectId: project.id,
    },
    req.io
  );

  const statusPromises = defaultStatuses.map((status) =>
    Status.create({ name: status, projectId: project.id })
  );

  await Promise.all(statusPromises);

  res.status(201).json({
    message: "Project created successfully with default statuses.",
    project,
  });
});

export const getStatuses = asyncMiddleware(async (req, res) => {
  const { projectId } = req.params;

  try {
    const statuses = await Status.findAll({
      where: { projectId },
      attributes: ["id", "name"],
    });

    res.status(200).json(statuses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

export const getActivityLogs = asyncMiddleware(async (req, res) => {
  try {
    let { projectId } = req.params;
    let logs = await ActivityLog.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          as: "user", // Fetch the lead details
          attributes: ["id", "name", "email"], // Only select necessary fields
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    console.log("logs fetched...", logs);
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update Single Status
export const updateStatus = async (req, res) => {
  const { statusId } = req.params;
  try {
    const { name } = req.body;
    const status = await Status.findOne({ where: { id: statusId } });

    if (!status) {
      return res
        .status(404)
        .json({ message: `Status with id ${statusId} not found.` });
    }

    const oldStatus = status.name;
    if (oldStatus !== name) {
      await status.update({ name });

      const project = await Project.findOne({
        where: { id: status.projectId },
      });
      const log = createActivityLog(
        "statusUpdated",
        {
          updaterName: req.user.name,
          oldStatus,
          newStatus: name,
          projectName: project.name,
          userId: req.user.id,
          entityId: status.id,
          workspaceId: project.workspaceId,
          projectId: project.id,
        },
        req.io
      );
    }

    res.status(200).json(status);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Create New Status
export const createStatus = async (req, res) => {
  const { projectId } = req.params;
  try {
    const { name } = req.body;
    const project = await Project.findOne({ where: { id: projectId } });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const newStatus = await Status.create({ name, projectId });
    const log = generateLogContent("statusCreated", {
      creatorName: req.user.name,
      newStatus: name,
      projectName: project.name,
    });

    res.status(201).json(newStatus);
  } catch (err) {
    console.error("Error creating status:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// export const getTeamMembers = asyncMiddleware(async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     // Fetch user projects and include the associated user object
//     const userProjects = await UserProject.findAll({
//       where: { projectId, status:'active' },
//       include: [
//         {
//           model: User, // The associated User model
//           as: 'user', // Alias used for the association
//           attributes: { exclude: ['password'] }, // Exclude sensitive fields like password
//         },
//         {
//           model: Role, // The associated User model
//           as: 'role', // Alias used for the association
//         },
//       ],
//       raw: true, // Flatten the result
//       nest: false, // Avoid nested objects
//     });

//     console.log(userProjects)

//     const result = userProjects.map((item) => {
//       const flattenedItem = { ...item }; // Copy all keys
//       // Merge keys prefixed with `user.` into the main object
//       Object.keys(flattenedItem).forEach((key) => {
//         if (key.startsWith('user.')) {
//           const newKey = key.replace('user.', ''); // Remove `user.` prefix
//           flattenedItem[newKey] = flattenedItem[key]; // Add new key
//           delete flattenedItem[key]; // Remove old `user.` key
//         }
//       });
//       return flattenedItem;
//     });

//     console.log('User projects are:', result);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error('Error fetching team members:', error);
//     res.status(500).json({ error: 'An error occurred while fetching team members' });
//   }
// });

export const getTeamMembers = asyncMiddleware(async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch team members
    const userProjects = await UserProject.findAll({
      where: { projectId, status: "active" },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
        {
          model: Role,
          as: "role",
        },
      ],
      raw: true,
      nest: false,
    });

    // Fetch tasks grouped by user
    const tasks = await Task.findAll({
      where: { projectId },
      attributes: [
        "assignedToId",
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "totalTasks"],
      ],
      group: ["assignedToId", "status"],
      raw: true,
    });

    console.log("Number of task found for ", tasks.length);

    // Process task counts
    const statuses = await Status.findAll({
      where: { projectId },
      attributes: ["id", "name"],
    });

    const taskCounts = {};
    tasks.forEach(({ assignedToId, status, totalTasks }) => {
      if (!taskCounts[assignedToId]) {
        taskCounts[assignedToId] = {
          totalTasks: 0,
        };
      }

      taskCounts[assignedToId].totalTasks += totalTasks;

      statuses.forEach((s) => {
        if (status == s.id) {
          if (!taskCounts[assignedToId][s.name]) {
            taskCounts[assignedToId][s.name] = 0; // Initialize to 0 before adding
          }
          taskCounts[assignedToId][s.name] += totalTasks;
        }
      });
    });

    console.log("Number of task counts for ", taskCounts);

    // Merge task counts with user data
    const result = userProjects.map((item) => {
      const userId = item["user.id"];
      const flattenedItem = { id: userId }; // Start with user ID

      // Flatten user keys
      Object.keys(item).forEach((key) => {
        if (key.startsWith("user.")) {
          flattenedItem[key.replace("user.", "")] = item[key]; // Remove `user.` prefix
        } else if (!key.startsWith("role.")) {
          flattenedItem[key] = item[key]; // Keep other keys as they are
        }
      });

      // Add role separately
      flattenedItem["role"] = item["role.name"]; // Assuming role name exists
      flattenedItem["roleId"] = item["role.id"]; // Assuming role name exists
      flattenedItem["taskCounts"] = taskCounts[userId];

      return flattenedItem;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching team members" });
  }
});

export const updateMember = asyncMiddleware(async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { roleId } = req.body;

    // Fetch user projects and include the associated user object
    const userProject = await UserProject.findOne({
      where: { projectId, userId },
    });

    if (!userProject) {
      return res
        .status(404)
        .json({ message: "User has not associated to the project!" });
    }

    userProject.status = "active";
    userProject.roleId = parseInt(roleId);
    userProject.save();

    res.status(200).json(userProject);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching team members" });
  }
});

export const getMemberRole = asyncMiddleware(async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    // Fetch user projects and include the associated user object
    const userProject = await UserProject.findOne({
      where: { projectId, userId },
      include: {
        model: Role, // The associated User model
        as: "role", // Alias used for the association
      },
    });

    res.status(200).json(userProject);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching team members" });
  }
});

export const getProjects = asyncMiddleware(async (req, res) => {
  try {
    const userId = req.user.id;

    const createdProjects = await Project.findAll({
      where: { createdBy: userId, isDeleted : false },
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
        as: "project",
        where : {isDeleted : false}
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

export const getSingleProject = asyncMiddleware(async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    // Check if the user is the creator of the project
    const createdProject = await Project.findOne({
      where: { id: projectId, createdBy: userId },
      include : [
        {
          model : User,
          as : 'leadUser',
          attributes : ['id', 'name', 'avatar']
        }
      ]
    });

    // Check if the user is assigned to the project
    const assignedProject = await UserProject.findOne({
      where: { userId, projectId },
      include: {
        model: Project,
        as: "project",
      },
    });

    // If the user has no access to the project
    if (!createdProject && !assignedProject) {
      return res
        .status(403)
        .json({ message: "Access denied to this project." });
    }

    // Get the project details
    const project = createdProject ? createdProject : assignedProject.project;

    // Get team size for the project
    const teamSize = await UserProject.count({ where: { projectId } });

    // Respond with project details
    res.status(200).json({
      ...project.toJSON(),
      role: createdProject ? "Created by You" : "Assigned to You",
      teamSize: createdProject ? teamSize + 1 : teamSize,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


export const updatedProject = asyncMiddleware(async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ where: { id: projectId } });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    Object.keys(req.body).forEach((key) => {
      if (project[key] !== undefined) {
        project[key] = req.body[key];
      }
    });

    await project.save();

    createActivityLog(
      "projectUpdated",
      {
        userId: req.user.id,
        workspaceId: project.workspaceId,
        projectId: project.id,
        projectName: project.name,
        editorName: req.user.name,
        entityId: project.id,
        entityType: "project",
      },
      req.io
    );

    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const removeMember = asyncMiddleware(async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    // Find the member in the project
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const userProject = await UserProject.findOne({
      where: { projectId, userId: userId },
    });
    if (!userProject) {
      return res
        .status(404)
        .json({ message: "Member not found in this project" });
    }

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the member from the project
    await UserProject.destroy({ where: { projectId, userId: userId } });

    // Generate email content
    const emailContent = generateEmailContent("removedFromProjectTemplate", {
      userName: user.name,
      projectName: project.name,
      supportLink: "https://easyassigns.com/support",
    });

    // Send notification email
    await sendEmail(user.email, emailContent.subject, emailContent.body);

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const createCalendarEvent = asyncMiddleware(async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, eventDate, type } = req.body;

    // Validate required fields
    if (!title || !eventDate) {
      return res
        .status(400)
        .json({ error: "Title and event date are required." });
    }

    // Create event
    const event = await CalendarEvent.create({
      userId: req.user.id,
      projectId,
      title,
      description,
      eventDate,
      type,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const getCalendarEvents = asyncMiddleware(async (req, res) => {
  try {
    const { projectId, day } = req.params;

    // Check if 'day' is a full date (YYYY-MM-DD) or just a month (YYYY-MM)
    if (day.length === 10) {
      // Fetch events for a specific day
      const startOfDay = `${day} 00:00:00`;
      const endOfDay = `${day} 23:59:59`;

      const events = await CalendarEvent.findAll({
        where: {
          projectId,
          eventDate: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      return res.status(200).json(events);
    } else if (day.length === 7) {
      // Fetch events for the entire month
      const startOfMonth = `${day}-01 00:00:00`;
      const endOfMonth = new Date(`${day}-01`);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0); // Last day of the month

      const formattedEndOfMonth = `${
        endOfMonth.toISOString().split("T")[0]
      } 23:59:59`;

      const events = await CalendarEvent.findAll({
        where: {
          projectId,
          eventDate: {
            [Op.between]: [startOfMonth, formattedEndOfMonth],
          },
        },
      });

      return res.status(200).json(events);
    } else {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD or YYYY-MM." });
    }
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export const deleteCalendarEvent = asyncMiddleware(async (req, res) => {
  try {
    const { projectId, eventId } = req.params;

    const event = await CalendarEvent.findOne({
      where: { id: eventId, projectId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    await event.destroy();

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export const deleteProject = asyncMiddleware(async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Soft delete the project
    await project.update({ isDeleted: true });

    // Fetch admin and owner roles
    const adminRole = await Role.findOne({ where: { name: "admin" } });
    const ownerRole = await Role.findOne({ where: { name: "owner" } });

    // Get all workspace admins and owners
    const workspaceAdminsAndOwners = await UserWorkspace.findAll({
      where: {
        workspaceId: project.workspaceId,
        roleId: { [Op.in]: [adminRole.id, ownerRole.id] },
      },
    });

    // Get all project members
    const projectMembers = await UserProject.findAll({
      where: { projectId: project.id },
    });

    // Map to extract userIds
    const workspaceUserIds = workspaceAdminsAndOwners.map((ws) => ws.userId);
    const projectMemberUserIds = projectMembers.map((pm) => pm.userId);

    // Combine arrays, remove duplicates, and filter out the deleting user
    const allUserIds = [
      ...new Set([...workspaceUserIds, ...projectMemberUserIds]),
    ].filter((id) => id !== req.user.id);

    // Now send notification to allUserIds
    // (Assuming you have a notification key 'projectDeleted' and dynamicData to pass along)
    await createNotifications(
      allUserIds,
      "projectDeleted",
      { projectName: project.name, deletedBy : req.user.name },
      req.io  // Assuming req.io holds your socket.io instance
    );

    res.status(204).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});
