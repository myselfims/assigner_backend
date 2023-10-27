import { asyncMiddleware } from "../middlewares/async.js";
import { User } from "../db/models.js";
import Joi from "joi";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { transporter } from "../smtp.js";
import { generate } from "otp-generator";

export const getAllUsers = asyncMiddleware(async (req, res) => {
  let users = await User.findAll();
  res.send(users);
});

export const getSelf = asyncMiddleware(async (req, res) => {
  let user = await User.findByPk(req.user.id);
  if (!user) res.status(404).send("User not exist!");
  res.send(user);
});

export const deleteUser = asyncMiddleware(async (req, res) => {
  let user = await User.findByPk(req.params.id);
  if (!user) res.status(404).send("User not exist!");
  user.destroy();
  res.send("User deleted!");
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

  let token = JWT.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.jwtPrivateKey
  );

//   var url = `${req.protocol}://${req.get("host")}/verifyemail/${token}`;
    let otp = generate(4,{digits:true,lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false})

  const mailData = {
    from: "shaikhimran7585@gmail.com", // sender address
    to: user.email, // list of receivers
    subject: `Verify your email!`,
    text: "",
    html: `<b>Hello! ${user.name}</b><br>Here is your otp : ${otp}<br/><hr/>`,
  };
  transporter.sendMail(mailData);

  res.status(201).send({ user, token });
});
