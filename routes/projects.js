import express from "express";
import { addProject, getProjects, getStatuses, getTeamMembers, updateMember, getSingleProject, getMemberRole, removeMember, updateStatus, createStatus, getActivityLogs, createCalendarEvent, getCalendarEvents, deleteCalendarEvent, updatedProject, deleteProject } from "../controllers/projects.js";
import auth from "../middlewares/auth.js";

const router = express.Router()

router
.post('/', auth() ,addProject)
.get('/', auth(), getProjects)
.get('/:projectId', auth(), getSingleProject)
.patch('/:projectId', auth(), updatedProject)
.get('/statuses/:projectId', auth(), getStatuses)
.get('/:projectId/activity-logs', auth(), getActivityLogs)
.patch('/statuses/:statusId', auth(), updateStatus)
.post('/statuses/:projectId', auth(), createStatus)
.get('/team/:projectId', auth(), getTeamMembers)
.patch('/team/:projectId/:userId', auth(), updateMember)
.get('/:projectId/member/role', auth(), getMemberRole)
.delete('/team/:projectId/:userId', auth(), removeMember)
.post('/:projectId/calendar', auth(), createCalendarEvent)
.get('/:projectId/calendar/:day', auth(), getCalendarEvents)
.delete('/:projectId/calendar/:eventId', auth(), deleteCalendarEvent)
.delete('/:projectId/', auth(), deleteProject)



export default router