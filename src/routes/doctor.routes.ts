import { Router } from 'express';
import { create, getById, list } from '../controllers/doctor.controller';
import {
  createForDoctor,
  listByDoctor,
  removeFromDoctor,
} from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('admin'));

router.post('/', create);
router.get('/', list);

router.get('/:id/patients', listByDoctor);
router.post('/:id/patients', createForDoctor);
router.delete('/:id/patients/:patientId', removeFromDoctor);

router.get('/:id', getById);

export default router;
