import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getCourse,
  listCourses,
  updateCourse,
} from "../controllers/course.controller";
import {
  createCourseSchema,
  getCourseSchema,
  updateCourseSchema,
} from "../schemas/course.schema";
import { validateRequest } from "../middlewares/validateRequest";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.use(requireAuth());

router.get("/", requireRole("ADMIN", "TEACHER"), listCourses);
router.get(
  "/:id",
  requireRole("ADMIN", "TEACHER"),
  validateRequest(getCourseSchema),
  getCourse,
);
router.post(
  "/",
  requireRole("ADMIN"),
  validateRequest(createCourseSchema),
  createCourse,
);
router.put(
  "/:id",
  requireRole("ADMIN"),
  validateRequest(updateCourseSchema),
  updateCourse,
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  validateRequest(getCourseSchema),
  deleteCourse,
);

export const courseRoutes = router;
