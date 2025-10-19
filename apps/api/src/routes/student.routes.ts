import { Router } from "express";
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller";
import {
  createStudentSchema,
  getStudentSchema,
  paginationQuerySchema,
  updateStudentSchema,
} from "../schemas/student.schema";
import { validateRequest } from "../middlewares/validateRequest";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.use(requireAuth());

router.get(
  "/",
  validateRequest(paginationQuerySchema),
  requireRole("ADMIN", "TEACHER"),
  listStudents,
);
router.get(
  "/:id",
  validateRequest(getStudentSchema),
  requireRole("ADMIN", "TEACHER"),
  getStudent,
);
router.post(
  "/",
  requireRole("ADMIN"),
  validateRequest(createStudentSchema),
  createStudent,
);
router.put(
  "/:id",
  requireRole("ADMIN"),
  validateRequest(updateStudentSchema),
  updateStudent,
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  validateRequest(getStudentSchema),
  deleteStudent,
);

export const studentRoutes = router;
