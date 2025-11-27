import { z } from 'zod';

const base = z.object({
  code: z.string().min(1, 'Mã lớp không được để trống'),
  name: z.string().min(1, 'Tên lớp không được để trống'),
  size: z.number().int().nonnegative().optional(),
  homeroomTeacherId: z.string().optional(),
});

export const createClassSchema = z.object({
  body: base,
});

export const updateClassSchema = z.object({
  params: z.object({ id: z.string() }),
  body: base.partial(),
});

export const getClassSchema = z.object({
  params: z.object({ id: z.string() }),
});
