import { Schema, model, type InferSchemaType } from 'mongoose';

const gradeSchema = new Schema(
  {
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
      unique: true,
    },
    attendance: { type: Number, default: 0, min: 0, max: 10 },
    midterm: { type: Number, default: 0, min: 0, max: 10 },
    final: { type: Number, default: 0, min: 0, max: 10 },
    total: { type: Number, default: 0, min: 0, max: 10 },
    gpa4: { type: Number, default: 0, min: 0, max: 4 },
    letterGrade: { type: String, default: 'F' },
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type Grade = InferSchemaType<typeof gradeSchema>;
export const GradeModel = model<Grade>('Grade', gradeSchema);
