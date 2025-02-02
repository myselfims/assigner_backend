import express from 'express';
import auth from '../middlewares/auth.js';
import {getProjectMessage, sendMessage, deleteMessage, pinMessage, getPinnedMessages} from '../controllers/chat.js'

const router = express.Router()

router.post('/', auth(), sendMessage)
.get('/project/:projectId', auth(), getProjectMessage)
.get('/pinned-messages/', auth(), getPinnedMessages)
.delete('/:messageId', auth(), deleteMessage)
.post('/pin/:messageId', auth(), pinMessage)

export default router