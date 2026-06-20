import { Router } from 'express';
import { getProjects, createProject, updateProjectProgress } from '../controllers/project.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getProjects as any);
router.post('/', createProject as any);
router.patch('/:id/progress', updateProjectProgress as any);

export default router;
