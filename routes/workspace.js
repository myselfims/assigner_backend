import express from "express";
import auth from "../middlewares/auth.js";
import { createWorkspace, getWorkspaces, getProjects } from "../controllers/workspace.js";

const router = express.Router();
router.get('/', auth(), getWorkspaces)
router.get('/:workspaceId/projects', auth(), getProjects)
router.post("/", auth(), createWorkspace);

export default router;
