import { z } from 'zod';

export const listUsersSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'ACTIVE', 'LOCKED']).optional(),
    role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const approveUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    studentId: z.string().optional(),
    teacherId: z.string().optional(),
  }),
});

export const lockUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().min(1, 'Lý do khóa không được để trống'),
  }),
});

export const unlockUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const linkAccountSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    studentId: z.string().optional(),
    teacherId: z.string().optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
export type ApproveUserBody = z.infer<typeof approveUserSchema>['body'];
export type LockUserBody = z.infer<typeof lockUserSchema>['body'];
export type LinkAccountBody = z.infer<typeof linkAccountSchema>['body'];

