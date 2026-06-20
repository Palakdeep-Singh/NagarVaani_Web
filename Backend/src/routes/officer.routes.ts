import { Router } from 'express';
import { getOfficers } from '../controllers/officer.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getOfficers as any);

export default router;
