import { Router } from 'express';
import { getById, list, remove, update } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', list);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
