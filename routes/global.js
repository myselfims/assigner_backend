import express from "express";
import { getAccountTypes, getRoles,getIndustries } from "../controllers/global.js";

const router = express.Router()

router.get('/account-types',getAccountTypes)
.get('/roles', getRoles)
.get('/industries', getIndustries)



export default router