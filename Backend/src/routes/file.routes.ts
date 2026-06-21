import { Router } from 'express';
import { getFiles, approveFile, rejectFile } from '../controllers/file.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getFiles as any);
router.patch('/:id/approve', approveFile as any);
router.patch('/:id/reject', rejectFile as any);

export default router;
