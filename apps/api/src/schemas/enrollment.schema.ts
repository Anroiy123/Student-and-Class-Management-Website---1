import { z } from "zod";

const base = z.object({
  studentId: z.string().min(1),
  classId: z.string().optional(),
  courseId: z.string().min(1),
  semester: z.string().min(1),
});

export const createEnrollmentSchema = z.object({
  body: base,
});

export const deleteEnrollmentSchema = z.object({
  params: z.object({ id: z.string() }),
});

export const listEnrollmentSchema = z.object({
  query: z.object({
    classId: z.string().optional(),
    courseId: z.string().optional(),
    studentId: z.string().optional(),
    semester: z.string().optional(),
  }),
});
