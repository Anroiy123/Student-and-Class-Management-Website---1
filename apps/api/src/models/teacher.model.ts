import { Schema, model, type InferSchemaType } from 'mongoose';

export const TEACHER_STATUS = ['ACTIVE', 'ON_LEAVE', 'RETIRED'] as const;
export type TeacherStatus = (typeof TEACHER_STATUS)[number];

const teacherSchema = new Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    department: { type: String, default: null },
    specialization: { type: String, default: null },
    status: {
      type: String,
      enum: TEACHER_STATUS,
      default: 'ACTIVE',
    },
    hireDate: { type: Date, default: null },
  },
  { timestamps: true },
);

teacherSchema.index({ fullName: 'text', employeeId: 1 });

export type Teacher = InferSchemaType<typeof teacherSchema>;
export const TeacherModel = model<Teacher>('Teacher', teacherSchema);

