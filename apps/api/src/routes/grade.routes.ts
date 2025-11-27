import { Router } from "express";
import { listGrades, upsertGrade, getGradeStatistics } from "../controllers/grade.controller";
import {
  listGradesSchema,
  upsertGradeSchema,
} from "../schemas/grade.schema";
import { validateRequest } from "../middlewares/validateRequest";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.use(requireAuth());

router.get(
  "/",
  requireRole("ADMIN", "TEACHER"),
  validateRequest(listGradesSchema),
  listGrades,
);

router.get(
  "/statistics",
  requireRole("ADMIN", "TEACHER"),
  validateRequest(listGradesSchema),
  getGradeStatistics,
);
router.put(
  "/:enrollmentId",
  requireRole("ADMIN", "TEACHER"),
  validateRequest(upsertGradeSchema),
  upsertGrade,
);

export const gradeRoutes = router;
