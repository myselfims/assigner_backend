import express from 'express';
import auth from '../middlewares/auth.js';
import { getAllNotifications } from '../controllers/notifications.js';

const router = express.Router()

router.get('/', auth(), getAllNotifications)

export default router