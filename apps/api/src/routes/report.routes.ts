import { Router } from 'express';
import {
  exportReport,
  getAvailableCourses,
} from '../controllers/report.controller';
import { exportReportSchema } from '../schemas/report.schema';
import { validateRequest } from '../middlewares/validateRequest';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.use(requireAuth());

router.get(
  '/available-courses',
  requireRole('ADMIN', 'TEACHER'),
  getAvailableCourses,
);

router.get(
  '/export',
  requireRole('ADMIN', 'TEACHER'),
  validateRequest(exportReportSchema),
  exportReport,
);

export const reportRoutes = router;
