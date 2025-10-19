import { Schema, model, type InferSchemaType } from "mongoose";

const studentSchema = new Schema(
  {
    mssv: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true, index: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", default: null },
  },
  { timestamps: true },
);

studentSchema.index({ fullName: "text", mssv: 1 });

export type Student = InferSchemaType<typeof studentSchema>;
export const StudentModel = model<Student>("Student", studentSchema);
