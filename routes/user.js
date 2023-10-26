import express from "express";
import auth from "../middlewares/auth.js";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getSelf,
  updateUser,
} from "../controllers/users.js";

const router = express.Router();

router.get("/", auth(true), getAllUsers);
router.post("/", createUser);

router.get("/self", auth(), getSelf);

router.delete("/:id", auth(true), deleteUser);
router.patch("/:id", auth(true), updateUser);

export default router;
