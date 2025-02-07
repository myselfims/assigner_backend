import express from "express";
import { addProject, getProjects, getStatuses, updateStatuses, getTeamMembers, updateMember, getSingleProject, getMemberRole } from "../controllers/projects.js";
import auth from "../middlewares/auth.js";

const router = express.Router()

router
.post('/', auth() ,addProject)
.get('/', auth(), getProjects)
.get('/:projectId', auth(), getSingleProject)
.get('/statuses/:projectId', auth(), getStatuses)
.post('/statuses/:projectId', auth(), updateStatuses)
.get('/team/:projectId', auth(), getTeamMembers)
.patch('/team/:projectId/:userId', auth(), updateMember)
.get('/:projectId/member/role', auth(), getMemberRole)



export default router