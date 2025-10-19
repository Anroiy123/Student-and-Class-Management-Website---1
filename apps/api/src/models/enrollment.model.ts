import { Schema, model, type InferSchemaType } from "mongoose";

const enrollmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", default: null },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    semester: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

enrollmentSchema.index(
  { studentId: 1, courseId: 1, semester: 1 },
  { unique: true },
);

export type Enrollment = InferSchemaType<typeof enrollmentSchema>;
export const EnrollmentModel = model<Enrollment>("Enrollment", enrollmentSchema);
