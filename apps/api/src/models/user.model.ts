import { Schema, model, type InferSchemaType } from 'mongoose';

export const USER_ROLES = ['ADMIN', 'TEACHER', 'STUDENT'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUS = ['PENDING', 'ACTIVE', 'LOCKED'] as const;
export type UserStatus = (typeof USER_STATUS)[number];

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'STUDENT',
    },
    status: {
      type: String,
      enum: USER_STATUS,
      default: 'PENDING',
    },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', default: null },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    lockedAt: { type: Date, default: null },
    lockedReason: { type: String, default: null },
  },
  { timestamps: true },
);

userSchema.index({ status: 1 });
userSchema.index({ role: 1, status: 1 });

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model<User>('User', userSchema);
