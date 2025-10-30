import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../models/user.model";

// Middleware kiểm tra quyền truy cập theo role
export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Kiểm tra user đã authenticated chưa
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please login first",
      });
    }

    // Kiểm tra user có role được phép không
    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden - Required roles: ${allowedRoles.join(", ")}. Your role: ${userRole}`,
      });
    }

    // User có quyền, cho phép tiếp tục
    next();
  };
};

// Middleware chỉ cho Admin
export const adminOnly = checkRole("ADMIN");

// Middleware cho Admin và Teacher
export const adminOrTeacher = checkRole("ADMIN", "TEACHER");

// Middleware cho tất cả authenticated users
export const authenticated = checkRole("ADMIN", "TEACHER", "STUDENT");
