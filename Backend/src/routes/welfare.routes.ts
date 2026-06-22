import { Router } from 'express';
import { getWelfareApplications, updateWelfareStatus } from '../controllers/welfare.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getWelfareApplications as any);
router.patch('/:id/status', updateWelfareStatus as any);

export default router;
