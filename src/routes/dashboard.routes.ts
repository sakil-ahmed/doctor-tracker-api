import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', getStats);

export default router;
