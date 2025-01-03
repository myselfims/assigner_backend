import { asyncMiddleware } from "../middlewares/async.js";
import { User } from "../db/models.js";
import Joi from "joi";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { Sequelize } from "sequelize";


export const getAllUsers = asyncMiddleware(async (req, res) => {
  const query = req.query.query; // Get the query parameter from the request
  
  let users;
  if (query) {
    // If query exists, filter users by both name and email
    users = await User.findAll({
      where: Sequelize.or(
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('name')),
          'LIKE',
          `%${query.toLowerCase()}%`
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('email')),
          'LIKE',
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

  return res.status(201).send({ user, token });
});


export const resetPassword = asyncMiddleware( async (req, res)=> {
  let user = await User.findOne({ where: { email: req.body.email } });
  if (user){
    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword
    user.save()
    return res.send(user)
  }
  return res.send({"msg": "User not found!"})
})