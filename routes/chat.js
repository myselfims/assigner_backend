import express from 'express';
import auth from '../middlewares/auth';
import {sendMessage} from '../controllers/chat.js'

const router = express.Router()

router.post('/', auth(), sendMessage)