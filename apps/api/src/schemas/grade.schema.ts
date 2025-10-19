import { z } from "zod";

const gradeBase = z.object({
  attendance: z.number().min(0).max(10).default(0),
  midterm: z.number().min(0).max(10).default(0),
  final: z.number().min(0).max(10).default(0),
});

export const upsertGradeSchema = z.object({
  params: z.object({ enrollmentId: z.string() }),
  body: gradeBase,
});

export const listGradesSchema = z.object({
  query: z.object({
    classId: z.string().optional(),
    courseId: z.string().optional(),
    studentId: z.string().optional(),
  }),
});
