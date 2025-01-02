import express from "express";
import auth from "../middlewares/auth.js";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getSelf,
  updateUser,
  resetPassword
} from "../controllers/users.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/", createUser);

router.get("/self", auth(), getSelf);
router.post("/password/reset", resetPassword)
router.delete("/:id", auth(true), deleteUser);
router.patch("/:id", auth(true), updateUser);

export default router;
