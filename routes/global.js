import express from "express";
import { getAccountTypes, getRoles,getIndustries, createRequest } from "../controllers/global.js";
import auth from "../middlewares/auth.js";

const router = express.Router()

router.get('/account-types',getAccountTypes)
.get('/roles', getRoles)
.get('/industries', getIndustries)
.post("/requests",auth(), createRequest) 


export default router