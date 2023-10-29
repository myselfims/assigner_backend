import express from "express";
import {sendOtp,verifyOtp} from '../controllers/otp.js'

const router = express.Router()

router.post('/send',sendOtp)
router.post('/verify/:otp',verifyOtp)



export default router