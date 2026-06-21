import { Router } from 'express';
import { getComplaints, createComplaint, updateComplaintStatus } from '../controllers/complaint.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getComplaints as any);
router.post('/', createComplaint as any);
router.patch('/:id/status', updateComplaintStatus as any);

export default router;
