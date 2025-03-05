import express from "express";
import auth from "../middlewares/auth.js";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getSelf,
  updateUser,
  resetPassword,
  updateSelf,
  addMember,
  checkUserExistence
} from "../controllers/users.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.post("/add-member", addMember);

router.get("/self", auth(), getSelf).patch("/self", auth(), updateSelf)
router.post("/password/reset", resetPassword)
router.delete("/:id", auth(true), deleteUser);
router.patch("/:id", auth(true), updateUser);
router.post("/check-user", auth(), checkUserExistence); // New API to check user existence


export default router;
