import { z } from "zod";

const base = z.object({
  code: z.string().min(1, "Mã môn không được để trống"),
  name: z.string().min(1, "Tên môn không được để trống"),
  credits: z.number().int().nonnegative(),
});

export const createCourseSchema = z.object({
  body: base,
});

export const updateCourseSchema = z.object({
  params: z.object({ id: z.string() }),
  body: base.partial(),
});

export const getCourseSchema = z.object({
  params: z.object({ id: z.string() }),
});
