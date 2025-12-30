import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    recipientType: z.enum(['user', 'role', 'all']),
    recipientIds: z.array(z.string()).optional(),
    recipientRole: z.enum(['STUDENT', 'TEACHER']).optional(),
    title: z.string().min(1, 'Title is required').max(200),
    message: z.string().min(1, 'Message is required').max(1000),
  }),
});

export const listNotificationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional().default(20),
    unreadOnly: z.enum(['true', 'false']).optional(),
  }),
});

export const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid notification ID'),
  }),
});
