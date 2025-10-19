import type { RequestHandler } from "express";
import { verifyAccessToken, type JwtPayload } from "../utils/jwt";

export const requireAuth = (): RequestHandler => (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole =
  (...roles: string[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
