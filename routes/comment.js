import express from "express";
import auth from "../middlewares/auth.js";
import { createComment, getComments } from "../controllers/comments.js";

const router = express.Router();

router
  .post("/:taskId/", auth(), createComment)

  .get("/:taskId", auth(), getComments);

export default router;
