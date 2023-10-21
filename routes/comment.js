import express from "express";
import Joi from "joi";
import auth from "../middlewares/auth.js";
import { Comment, User } from "../db/models.js";
import { asyncMiddleware } from "../middlewares/async.js";
import { createComment, getComments } from "../controllers/comments.js";

const router = express.Router();

router
  .post("/:taskId/", auth(), createComment)

  .get("/:taskId", auth(), getComments);

export default router;
