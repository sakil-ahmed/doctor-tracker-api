import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import doctorRoutes from './doctor.routes';
import healthRoutes from './health.routes';
import patientRoutes from './patient.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/health', healthRoutes);

export default router;
