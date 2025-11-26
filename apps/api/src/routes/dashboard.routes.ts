import { Router } from 'express';
import {
  getStats,
  getRecentActivities,
} from '../controllers/dashboard.controller';
import { getRecentActivitiesSchema } from '../schemas/dashboard.schema';
import { validateRequest } from '../middlewares/validateRequest';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.use(requireAuth());

router.get('/stats', requireRole('ADMIN', 'TEACHER'), getStats);
router.get(
  '/recent-activities',
  requireRole('ADMIN', 'TEACHER'),
  validateRequest(getRecentActivitiesSchema),
  getRecentActivities,
);

export const dashboardRoutes = router;
