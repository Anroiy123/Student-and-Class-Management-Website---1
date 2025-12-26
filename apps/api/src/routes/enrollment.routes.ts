import { Router } from 'express';
import {
  createEnrollment,
  deleteEnrollment,
  listEnrollments,
  listSemesters,
} from '../controllers/enrollment.controller';
import {
  createEnrollmentSchema,
  deleteEnrollmentSchema,
  listEnrollmentSchema,
} from '../schemas/enrollment.schema';
import { validateRequest } from '../middlewares/validateRequest';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.use(requireAuth());

router.get(
  '/',
  requireRole('ADMIN', 'TEACHER'),
  validateRequest(listEnrollmentSchema),
  listEnrollments,
);
router.get(
  '/semesters',
  requireRole('ADMIN', 'TEACHER'),
  listSemesters,
);
router.post(
  '/',
  requireRole('ADMIN'),
  validateRequest(createEnrollmentSchema),
  createEnrollment,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validateRequest(deleteEnrollmentSchema),
  deleteEnrollment,
);

export const enrollmentRoutes = router;
