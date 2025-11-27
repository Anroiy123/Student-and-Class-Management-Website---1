import { Router } from 'express';
import { listTeachers, getTeacher } from '../controllers/teacher.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.use(requireAuth());

router.get('/', requireRole('ADMIN', 'TEACHER'), listTeachers);
router.get('/:id', requireRole('ADMIN', 'TEACHER'), getTeacher);

export const teacherRoutes = router;

