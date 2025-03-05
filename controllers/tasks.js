import { Task } from "../db/task.js";
import { User } from "../db/user.js";
import { asyncMiddleware } from "../middlewares/async.js";
import Joi from "joi";
import { transporter, sendEmail } from "../smtp.js";
import { generateEmailContent } from "../config/emailTemplates.js";
import { createNotification } from "../services/notificationService.js";
import { Project } from "../db/project.js";
import { createActivityLog } from "../services/activityLogService.js";
import ActivityLog from "../db/activityLog.js";
import Workspace from "../db/workspace.js";
import { Comment } from "../db/commectAndOtp.js";

let schema = Joi.object({
  sprintId: Joi.number(),
  projectId: Joi.number().required(),
  title: Joi.string().min(2).required(),
  description: Joi.string().optional(),
  deadline: Joi.date().required(),
  assignedToId: Joi.number().required(),
  rank : Joi.number(),
});

export const getAllTasks = asyncMiddleware(async (req, res) => {
  let tasks;
  let { projectId } = req.params;
  if (req.user.isAdmin) {
    tasks = await Task.findAll({ where: { projectId: projectId } });
  } else {
    tasks = await Task.findAll({
      where: { assignedToId: req.user.id, projectId: projectId },
    });
  }

  res.send(tasks);
});

export const createTask = asyncMiddleware(async (req, res) => {
  try {
    // Validate request body
    let { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { projectId, sprintId, title, description, deadline, assignedToId } =
      req.body;

    // Get the count of existing tasks in the project (for zero-based indexing)
    const taskCount = (await Task.count({ where: { projectId } })) + 1;
    const project = Project.findOne({ where: { id: projectId } });
    // Create the task with the correct index
    let task = await Task.create({
      sprintId,
      projectId,
      title,
      description,
      deadline,
      assignedById: req.user.id,
      assignedToId,
      index: taskCount, // Ensures indexing starts from 0
    });

    // Fetch user details for email notification
    let creater = await User.findByPk(req.user.id);
    let user = await User.findByPk(assignedToId);
    // userId, title, message, type = "info", priority = 3, redirectUrl = null, io
    createNotification(
      user?.id,
      "newTaskAssigned",
      { taskName: task.title, assignedBy: creater.name },
      req.io
    );

    let log = createActivityLog(
      "taskCreated",
      {
        taskName: title,
        creatorName: creater.name,
        projectName: project.name,
        userId: req.user.id,
        projectId: project.id,
        workspaceId: project.workspaceId,
        entityId : task.id
      },
      req.io
    );

    // Generate email content
    const emailContent = generateEmailContent("assignedTaskTemplate", {
      userName: user.name,
      projectName: "null",
      taskName: task.title,
      dueDate: task.deadline,
      assignedBy: creater.name,
      taskLink: "http://google.com/",
    });

    // Send email notification
    sendEmail(user.email, emailContent.subject, emailContent.body).then(() => {
      console.log("Mail sent");
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

export const getTask = asyncMiddleware(async (req, res) => {
  let task = await Task.findByPk(req.params.id);
  if (!task) res.status(404).send("Task not found!");

  res.send(task);
});

export const deleteTask = asyncMiddleware(async (req, res) => {
  let task = await Task.findByPk(req.params.id);
  if (!task) res.status(404).send("Task not found!");
  task.destroy();
  res.send("Task deleted!");
});

export const updateFull = asyncMiddleware(async (req, res) => {
  let { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let task = await Task.findByPk(req.params.id);

  for (let key of Object.keys(req.body)) {
    task[key] = req.body[key];
  }

  task.save();
  res.send(task);
});

export const update = asyncMiddleware(async (req, res) => {
  let task = await Task.findByPk(req.params.id);

  for (let key of Object.keys(req.body)) {
    if (task[key]) {
      task[key] = req.body[key];
    } else {
      console.log("task[key]",key)
      continue
    }
  }

  task.save();

  // Fetch Project Owner and Lead
  const project = await Project.findByPk(task.projectId);
  const assignedById = task.assignedById;
  const projectOwner = project.createdBy; // Assuming ownerId field in Project model
  const projectLead = project.lead; // Assuming leadId field in Project model
  console.log("project is ", project);

  // Send notifications
  if (assignedById) {
    createNotification(
      assignedById,
      "taskUpdated",
      {
        taskName: task.title,
        updatedBy: req.user.name,
        projectId: project.id,
        projectName: project.name,
        taskId: task.id,
      },
      req.io
    );
  }
  if (projectOwner) {
    createNotification(
      projectOwner,
      "taskUpdated",
      {
        taskName: task.title,
        updatedBy: req.user.name,
        projectId: project.id,
        projectName: project.name,
        taskId: task.id,
      },
      req.io
    );
  }

  if (projectLead) {
    createNotification(
      projectLead,
      "taskUpdated",
      {
        taskName: task.title,
        updatedBy: req.user.name,
        projectId: project.id,
        projectName: project.name,
        taskId: task.id,
      },
      req.io
    );
  }

  res.send(task);
});


export const getActivityLogs = asyncMiddleware( async (req, res)=>{
  try{
    const {taskId} = req.params;
    const logs = await ActivityLog.findAll({
      where : { entityId : taskId, entityType : 'task' },
      include: [
        {
          model: User,
          as: "user", // Fetch the lead details
          attributes: ["id", "name", "email"], // Only select necessary fields
        }],
        order: [["createdAt", "DESC"]] 

    })
    res.status(200).json(logs)

  }catch(error){
    console.log(error)
  }
})

export const createComment = asyncMiddleware(async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const commentObject = await Comment.create({
      comment,
      userId: req.user.id,
      parentId: taskId,
      parentType: "task",
    });

    req.io.to(`task-${taskId}`).emit("comment", {
      id: commentObject.id,
      comment: commentObject.comment,
      userId: req.user.id,
      createdAt: commentObject.createdAt,
      user : req.user
    });

    res.status(201).json(commentObject);
  } catch (error) {
    console.error("Comment creation failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export const getComments =  asyncMiddleware(async (req, res)=>{
  try{
    const {taskId} = req.params;
    const comments = await Comment.findAll({
      where : {parentId : taskId, parentType : 'task'},
      include : {
        model : User,
        as : 'user'
      }
    })

    res.status(200).json(comments)
  }catch (error) {
    console.error("Comment fetch failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
})