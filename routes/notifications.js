import express from 'express';
import auth from '../middlewares/auth.js';
import { getAllNotifications, readNotification } from '../controllers/notifications.js';

const router = express.Router()

router.get('/', auth(), getAllNotifications)
router.patch("/:id/read", auth(), readNotification);

export default router