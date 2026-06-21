import { Router } from 'express';
import { getMessages, createMessage } from '../controllers/message.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getMessages as any);
router.post('/', createMessage as any);

export default router;
