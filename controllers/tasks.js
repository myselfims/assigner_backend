import { Task, User } from "../db/models.js";
import { asyncMiddleware } from "../middlewares/async.js";
import Joi from "joi";
import { transporter } from "../smtp.js";

let schema = Joi.object({
  title: Joi.string().min(2).required(),
  description: Joi.string().required(),
  deadline: Joi.date().required(),
  assignedToId: Joi.number().required(),
});

export const getAllTasks = asyncMiddleware(async (req, res) => {
  let tasks;
  if (req.user.isAdmin) {
    tasks = await Task.findAll();
  } else {
    tasks = await Task.findAll({ where: { assignedToId: req.user.id } });
  }

  res.send(tasks);
});

export const createTask = asyncMiddleware(async (req, res) => {
  let { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let task = await Task.create({
    title: req.body.title,
    description: req.body.description,
    deadline: req.body.deadline,
    assignedById: req.user.id,
    assignedToId: req.body.assignedToId,
  });

  let creater = await User.findByPk(req.user.id);
  let user = await User.findByPk(req.body.assignedToId);

  console.log("this is email", req.user.assignedToId);

  const mailData = {
    from: "shaikhimran7585@gmail.com", // sender address
    to: user.email, // list of receivers
    subject: `${creater.name} is assigned you a new task`,
    text: "",
    html: `<b>Hey there! </b><br>You have a new task.<br/><hr/>Check here https://assinger.riseimstechnologies.com/. Title : ${task.title}`,
  };

  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(info);
    }
  });

  res.send(task);
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
      return res.status(400).send(`${key} not allowed!`);
    }
  }

  task.save();
  res.send(task);
});
