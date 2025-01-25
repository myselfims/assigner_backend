import { User } from "../db/user.js";
import { Comment } from "../db/commectAndOtp.js";
import { asyncMiddleware } from "../middlewares/async.js";
import Joi from "joi";

export const schema = Joi.object({
  comment: Joi.string().min(2).required(),
  userId : Joi.number().min(1).required(),
  taskId : Joi.number().min(1).required()
});

export const createComment = asyncMiddleware(async (req, res) => {
  let { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let comment = await Comment.create({
    comment: req.body.comment,
    taskId: parseInt(req.params.taskId),
    userId: req.user.id,
  });
  comment.userId = await User.findByPk(req.user.id).name;
  res.status(201).send(comment);
});

export const getComments = asyncMiddleware(async (req, res) => {
  try {
    let comments = await Comment.findAll({
      where: { taskId: req.params.taskId },
    });
    for (let c of comments) {
      let user = await User.findByPk(parseInt(c.userId));
      c["userId"] = user.name;
    }
    res.send(comments);
  } catch (er) {
    res.status(500).send(er);
  }
});
