import { Router } from 'express';
import {
  getStats,
  getRecentActivities,
  getChartData,
} from '../controllers/dashboard.controller';
import {
  getRecentActivitiesSchema,
  getChartsSchema,
} from '../schemas/dashboard.schema';
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
router.get(
  '/charts',
  requireRole('ADMIN', 'TEACHER'),
  validateRequest(getChartsSchema),
  getChartData,
);

export const dashboardRoutes = router;
