import { z } from 'zod';

export const getRecentActivitiesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(50).optional(),
  }),
});

