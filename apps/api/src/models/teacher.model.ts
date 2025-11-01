import { Schema, model, type InferSchemaType } from 'mongoose';

const teacherSchema = new Schema(
  {
    teacherId: { type: String, required: true, unique: true, trim: true }, // Mã giảng viên
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, default: null },
    department: { type: String, default: null }, // Khoa
    position: { type: String, default: 'Giảng viên' }, // Chức vụ
  },
  { timestamps: true },
);

export type Teacher = InferSchemaType<typeof teacherSchema>;
export const TeacherModel = model<Teacher>('Teacher', teacherSchema);
