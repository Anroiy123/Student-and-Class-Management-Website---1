import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import {
  getMyProfile,
  getMyGrades,
  getMyEnrollments,
  getMyDashboard,
  getAvailableSemesters,
  exportMyGrades,
} from '../controllers/me.controller';
import {
  getMyGradesSchema,
  getMyEnrollmentsSchema,
} from '../schemas/me.schema';

const router = Router();

// All routes require authentication
router.use(requireAuth());

// GET /api/me/profile - Get student profile
router.get('/profile', getMyProfile);

// GET /api/me/grades - Get student grades with pagination and filter
router.get('/grades', validateRequest(getMyGradesSchema), getMyGrades);

// GET /api/me/enrollments - Get student enrollments with pagination and filter
router.get(
  '/enrollments',
  validateRequest(getMyEnrollmentsSchema),
  getMyEnrollments
);

// GET /api/me/dashboard - Get student dashboard data
router.get('/dashboard', getMyDashboard);

// GET /api/me/semesters - Get available semesters for filter
router.get('/semesters', getAvailableSemesters);

// GET /api/me/grades/export - Export grades to PDF
router.get('/grades/export', exportMyGrades);

export default router;
