import { z } from "zod";

const passwordSchema = z
  .string()
  .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
  .max(64, "Mật khẩu không quá 64 ký tự");

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    password: passwordSchema,
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).default("STUDENT"),
    studentId: z.string().optional(),
    teacherId: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    password: passwordSchema,
  }),
});
