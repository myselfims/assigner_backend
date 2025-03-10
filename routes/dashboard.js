import express from "express";
import auth from "../middlewares/auth.js";
import { getWorkspaceActivityScore } from "../controllers/dashboard.js";

const router = express.Router()

router.get('/workspace-activity-score/:workspaceId', auth(), getWorkspaceActivityScore)


export default router