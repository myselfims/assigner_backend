import express from 'express';
import auth from '../middlewares/auth.js';
import { createOrganization } from '../controllers/organization.js';

const router = express.Router()

router.post('/', auth(), createOrganization)


export default router;