import { Schema, model, type InferSchemaType } from 'mongoose';

const classSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    size: { type: Number, default: 0 },
    homeroomTeacher: { type: String, default: null },
  },
  { timestamps: true },
);

export type Class = InferSchemaType<typeof classSchema>;
export const ClassModel = model<Class>('Class', classSchema);
