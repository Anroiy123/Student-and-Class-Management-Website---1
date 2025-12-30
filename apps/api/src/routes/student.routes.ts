import { Router } from 'express';
import multer from 'multer';
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudentsExcel,
  downloadTemplate,
} from '../controllers/student.controller';
import {
  createStudentSchema,
  getStudentSchema,
  paginationQuerySchema,
  updateStudentSchema,
} from '../schemas/student.schema';
import { validateRequest } from '../middlewares/validateRequest';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth());

router.get(
  '/',
  validateRequest(paginationQuerySchema),
  requireRole('ADMIN', 'TEACHER'),
  listStudents,
);
router.get(
  '/:id',
  validateRequest(getStudentSchema),
  requireRole('ADMIN', 'TEACHER'),
  getStudent,
);
router.post(
  '/',
  requireRole('ADMIN'),
  validateRequest(createStudentSchema),
  createStudent,
);
router.put(
  '/:id',
  requireRole('ADMIN'),
  validateRequest(updateStudentSchema),
  updateStudent,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validateRequest(getStudentSchema),
  deleteStudent,
);
router.post(
  '/import/excel',
  requireRole('ADMIN'),
  upload.single('file'),
  importStudentsExcel,
);
router.get('/template/excel', requireRole('ADMIN'), downloadTemplate);

export const studentRoutes = router;
