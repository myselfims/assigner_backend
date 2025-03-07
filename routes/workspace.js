import express from "express";
import auth from "../middlewares/auth.js";
import {
  createWorkspace,
  getWorkspaces,
  getProjects,
  getUsers,
  getActivityLogs,
  getUserRole,
  updateMember,
  updateWorkspace,
  transferOwnership,
  getTransferRequest
} from "../controllers/workspace.js";

const router = express.Router();
router.get("/", auth(), getWorkspaces);
router.patch("/:workspaceId", auth(), updateWorkspace);
router.get("/:workspaceId/role", auth(), getUserRole);
router.get("/:workspaceId/role", auth(), getUserRole);
router.get("/:workspaceId/activity-logs", auth(), getActivityLogs);
router.get("/:workspaceId/projects", auth(), getProjects);
router.get("/:workspaceId/users", auth(), getUsers);
router.post("/:workspaceId/transfer-ownership", auth(), transferOwnership);
router.get("/:workspaceId/transfer-request", auth(), getTransferRequest);
router.patch("/:workspaceId/members/:userId", auth(), updateMember);
router.post("/", auth(), createWorkspace);

export default router;
