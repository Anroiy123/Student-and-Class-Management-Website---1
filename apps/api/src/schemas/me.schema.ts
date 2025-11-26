import { z } from 'zod';

const paginationQuery = {
  semester: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
};

export const getMyGradesSchema = z.object({
  query: z.object(paginationQuery),
});

export const getMyEnrollmentsSchema = z.object({
  query: z.object(paginationQuery),
});

export type GetMyGradesQuery = z.infer<typeof getMyGradesSchema>['query'];
export type GetMyEnrollmentsQuery = z.infer<typeof getMyEnrollmentsSchema>['query'];
