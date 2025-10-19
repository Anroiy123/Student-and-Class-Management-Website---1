import { Router } from "express";
import {
  createClass,
  deleteClass,
  getClassById,
  listClasses,
  updateClass,
} from "../controllers/class.controller";
import {
  createClassSchema,
  getClassSchema,
  updateClassSchema,
} from "../schemas/class.schema";
import { validateRequest } from "../middlewares/validateRequest";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.use(requireAuth());

router.get("/", requireRole("ADMIN", "TEACHER"), listClasses);
router.get(
  "/:id",
  requireRole("ADMIN", "TEACHER"),
  validateRequest(getClassSchema),
  getClassById,
);
router.post(
  "/",
  requireRole("ADMIN"),
  validateRequest(createClassSchema),
  createClass,
);
router.put(
  "/:id",
  requireRole("ADMIN"),
  validateRequest(updateClassSchema),
  updateClass,
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  validateRequest(getClassSchema),
  deleteClass,
);

export const classRoutes = router;
