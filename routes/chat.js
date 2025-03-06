import express from 'express';
import auth from '../middlewares/auth.js';
import {getProjectMessage, sendMessage, deleteMessage,  pinMessage, getPinnedMessages, getUserMessage, getUnreadCounts, markMessagesAsRead, getRecentMessages, updateMessage, } from '../controllers/chat.js'

const router = express.Router()

router.post('/', auth(), sendMessage)
.get('/project/:projectId', auth(), getProjectMessage)
router.get('/unread-counts', auth(), getUnreadCounts)
router.get("/recent-messages", auth(), getRecentMessages)
.get('/:userId', auth(), getUserMessage)
.get('/pinned-messages/', auth(), getPinnedMessages)
.delete('/:messageId', auth(), deleteMessage)
.patch('/:messageId', auth(), updateMessage)
.post('/pin/:messageId', auth(), pinMessage)
.post('/mark-as-read/:userId', auth(), markMessagesAsRead)

export default router