import { asyncMiddleware } from "../middlewares/async.js";
import { Designation } from "../db/roleAndDesignation.js";
import { User } from "../db/user.js";
import { UserProject } from "../db/userProject.js";
import { Project } from "../db/project.js";
import Joi from "joi";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { Sequelize } from "sequelize";
import { sendEmail } from "../smtp.js";
import { generateEmailContent, templates } from "../config/emailTemplates.js";
import Workspace from "../db/workspace.js";
import { UserWorkspace } from "../db/userWorkspace.js";

export const getAllUsers = asyncMiddleware(async (req, res) => {
  const query = req.query.query; // Get the query parameter from the request

  let users;
  if (query) {
    // If query exists, filter users by both name and email
    users = await User.findAll({
      where: Sequelize.or(
        Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          "LIKE",
          `%${query.toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("email")),
          "LIKE",
          `%${query.toLowerCase()}%`
        )
      ),
    });
  } else {
    // If no query, return all users
    users = await User.findAll();
  }
  res.send(users);
});

export const getSelf = asyncMiddleware(async (req, res) => {
  let user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).send("User does not exist!"); // Ensure you return here
  }
  res.send(user); // Only send response if the user exists
});

export const deleteUser = asyncMiddleware(async (req, res) => {
  let user = await User.findByPk(req.params.id);
  if (!user) res.status(404).send("User not exist!");
  user.destroy();
  res.send("User deleted!");
});

export const updateSelf = asyncMiddleware(async (req, res) => {
  try {
    let user = await User.findByPk(req.user.id);
    console.log(user);
    if (!user) {
      return res.status(404).send("User not found!");
    }

    console.log("body", req.body);
    console.log("user", user);

    for (let key of Object.keys(req.body)) {
      console.log("key", key);
      console.log("has own prop", user.hasOwnProperty(key));
      if (user.dataValues.hasOwnProperty(key)) {
        if (key === "password") {
          let hashedPassword = await bcrypt.hash(req.body[key], 10);
          user[key] = hashedPassword;
        } else {
          user[key] = req.body[key];
        }
      } else {
        return res.status(400).send(`${key} is not allowed!`);
      }
    }

    await user.save(); // Make sure to await this operation
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the user.");
  }
});

export const updateUser = asyncMiddleware(async (req, res) => {
  let user = await User.findByPk(req.params.id);

  for (let key of Object.keys(req.body)) {
    if (user[key] || key == "avatar") {
      if (key == "password") {
        let hashedPassword = await bcrypt.hash(req.body[key], 10);
        user[key] = hashedPassword;
      } else {
        user[key] = req.body[key];
      }
    } else {
      return res.status(400).send(`${key} is not allowed!`);
    }
  }

  user.save();
  res.send(user);
});

export const createUser = asyncMiddleware(async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(12).required(),
    termsAndCondition: Joi.boolean(),
  });

  let { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let check = await User.findOne({ where: { email: req.body.email } });
  if (check) return res.status(400).send("User already exist!");

  let hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword, // Store the hashed password
  });

  let token = JWT.sign({ id: user.id, isAdmin: user.isAdmin }, "Imran@12");

  return res.status(201).send({ user, token });
});

const normalizeText = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

export async function findOrCreateDesignation(designation) {
  // Normalize the input
  const normalizedInput = normalizeText(designation);

  // Find matching designation
  let designationObj = await Designation.findOne({
    where: {
      name: normalizedInput, // Ensure normalized_name column exists
    },
  });

  if (!designationObj) {
    // If no match is found, create a new designation
    designationObj = await Designation.create({
      name: normalizedInput, // Original user input
    });
  }

  return designationObj;
}

export const addMember = asyncMiddleware(async (req, res) => {
  const body = req.body;
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    designation: Joi.string().optional(),
    projectId: Joi.number(),
    workspaceId: Joi.number().required(),
  });

  let { error } = schema.validate(req.body);
  console.log(error);

  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ where: { email: req.body.email } });
  let project;
  let workspace;

  if (body.projectId) {
    project = await Project.findByPk(body.projectId);
    if (!project) {
      return { success: false, message: "Project does not exist." };
    }
  }

  if (body.workspaceId) {
    workspace = await Workspace.findByPk(body.workspaceId);
    if (!workspace) {
      return { success: false, message: "Workspace does not exist." };
    }
  }

  let invitationText = project ? `project <strong> ${project.name} </strong>` : `workspace <strong>${workspace.name}</strong>`

  if (user) {
    let template = generateEmailContent('invitationExistingUserTemplate', {userName : user.name, projectName : invitationText, invitationLink : "https://easyassigns.com/"})
    sendEmail(user.email, template.subject, template.body)
  } else {
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword, // Store the hashed password
      designationId: designation.id,
    });
    let template = generateEmailContent('invitationExistingUserTemplate', {projectName : project.name, invitationLink : "https://easyassigns.com/"})
    sendEmail(user.email, template.subject, template.body)
  }

  let hashedPassword = await bcrypt.hash("asdfasdf", 10);
  let designation = await findOrCreateDesignation(body.designation);


  if (project) {
    UserProject.create({
      projectId: body.projectId,
      userId: user.id,
      roleId: 1,
      status: "active",
    });
  }
  if (workspace) {
    let defaultWorkspace = await UserWorkspace.findOne({
      where: { userId: user.id, isDefault: true },
    });

    UserWorkspace.create({
      workspaceId: body.workspaceId,
      userId: user.id,
      roleId: 1,
      status: "active",
      isDefault: defaultWorkspace ? false : true,
    });
  }

  let token = JWT.sign({ id: user.id, isAdmin: user.isAdmin }, "Imran@12");

  return res.status(201).send(user);
});

export const resetPassword = asyncMiddleware(async (req, res) => {
  let user = await User.findOne({ where: { email: req.body.email } });
  if (user) {
    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.save();
    return res.send(user);
  }
  return res.send({ msg: "User not found!" });
});

export const checkUserExistence = asyncMiddleware(async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
  });

  let { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ where: { email: req.body.email } });

  if (!user) return res.status(404).send("User does not exist!");

  return res.status(200).send(user);
});
