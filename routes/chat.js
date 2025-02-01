import express from 'express';
import auth from '../middlewares/auth.js';
import {getProjectMessage, sendMessage} from '../controllers/chat.js'

const router = express.Router()

router.post('/', auth(), sendMessage)
.get('/project/:projectId', auth(), getProjectMessage)

export default router