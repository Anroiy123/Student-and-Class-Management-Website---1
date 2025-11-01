import { Router } from "express";
import {
  createEnrollment,
  deleteEnrollment,
  listEnrollments,
} from "../controllers/enrollment.controller";
import {
  createEnrollmentSchema,
  deleteEnrollmentSchema,
  listEnrollmentSchema,
} from "../schemas/enrollment.schema";
import { validateRequest } from "../middlewares/validateRequest";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.use(requireAuth());

router.get(
  "/",
  requireRole("ADMIN", "TEACHER", "STUDENT"),
  validateRequest(listEnrollmentSchema),
  listEnrollments,
);
router.post(
  "/",
  requireRole("ADMIN"),
  validateRequest(createEnrollmentSchema),
  createEnrollment,
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  validateRequest(deleteEnrollmentSchema),
  deleteEnrollment,
);

export const enrollmentRoutes = router;
