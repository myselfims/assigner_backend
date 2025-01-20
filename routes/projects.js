import express from "express";
import { addProject, getProjects, getStatuses } from "../controllers/projects.js";
import auth from "../middlewares/auth.js";

const router = express.Router()

router
.post('/', auth() ,addProject)
.get('/', auth(), getProjects)
.get('/statuses/:projectId', auth(), getStatuses)



export default router