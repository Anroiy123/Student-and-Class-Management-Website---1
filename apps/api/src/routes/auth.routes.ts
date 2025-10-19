import { Router } from "express";
import {
  getProfile,
  login,
  register,
} from "../controllers/auth.controller";
import {
  loginSchema,
  registerSchema,
} from "../schemas/auth.schema";
import { validateRequest } from "../middlewares/validateRequest";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", requireAuth(), getProfile);

export const authRoutes = router;
