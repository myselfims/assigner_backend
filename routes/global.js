import express from "express";
import { getAccountTypes, getRoles } from "../controllers/global.js";

const router = express.Router()

router.get('/account-types',getAccountTypes)
.get('/roles', getRoles)



export default router