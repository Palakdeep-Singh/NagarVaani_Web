import { Router } from 'express';
import authRoutes from './auth.routes';
import complaintRoutes from './complaint.routes';
import projectRoutes from './project.routes';
import officerRoutes from './officer.routes';
import fileRoutes from './file.routes';
import messageRoutes from './message.routes';
import metricsRoutes from './metrics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/projects', projectRoutes);
router.use('/officers', officerRoutes);
router.use('/files', fileRoutes);
router.use('/messages', messageRoutes);
router.use('/metrics', metricsRoutes);

export default router;

