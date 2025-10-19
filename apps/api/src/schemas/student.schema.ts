import { z } from "zod";

const studentBaseSchema = z.object({
  mssv: z.string().min(1, "MSSV không được để trống"),
  fullName: z.string().min(1, "Họ tên không được để trống"),
  dob: z.string().min(1, "Ngày sinh không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(6, "Số điện thoại không hợp lệ"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  classId: z.string().optional(),
});

export const createStudentSchema = z.object({
  body: studentBaseSchema,
});

export const updateStudentSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: studentBaseSchema.partial(),
});

export const getStudentSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional(),
    q: z.string().optional(),
    classId: z.string().optional(),
  }),
});
