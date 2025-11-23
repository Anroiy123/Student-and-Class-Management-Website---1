import { z } from "zod";

export const exportReportSchema = z.object({
  query: z.object({
    classId: z.string().optional(),
    courseId: z.string().optional(),
    semester: z.string().optional(),
    format: z.enum(["excel", "pdf"]).default("excel"),
  }),
});

