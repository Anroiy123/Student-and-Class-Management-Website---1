import { Schema, model, type InferSchemaType } from "mongoose";

export const USER_ROLES = ["ADMIN", "TEACHER", "STUDENT"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "STUDENT",
    },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", default: null },
    teacherId: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model<User>("User", userSchema);
