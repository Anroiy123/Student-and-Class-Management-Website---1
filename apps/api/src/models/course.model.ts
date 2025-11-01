import { Schema, model, type InferSchemaType } from 'mongoose';

const courseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 0 },
    teacherEmail: { type: String, default: null },
    teacherName: { type: String, default: null },
  },
  { timestamps: true },
);

export type Course = InferSchemaType<typeof courseSchema>;
export const CourseModel = model<Course>('Course', courseSchema);
