import { Router } from 'express';
import { getHealthBeds, getHealthInventory, getSchoolSmartBoards, getGeneralMetrics } from '../controllers/metrics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/health/beds', getHealthBeds as any);
router.get('/health/inventory', getHealthInventory as any);
router.get('/education/smartboards', getSchoolSmartBoards as any);
router.get('/general', getGeneralMetrics as any);

export default router;
