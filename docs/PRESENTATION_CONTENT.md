# Tài liệu Tổng hợp Nội dung Trình bày

## Hệ thống Website Quản lý Sinh viên và Lớp học

---

## PHẦN 1: BACKEND SETUP

### 1.1 Setup Monorepo (TurboRepo, TypeScript, ESLint, Prettier)

#### Cấu trúc Monorepo

```
├── apps/
│   ├── api/          # Backend Express API
│   └── web/          # Frontend React SPA
├── package.json      # Root workspace config
├── turbo.json        # TurboRepo tasks
├── tsconfig.base.json # Shared TypeScript config
└── .prettierrc.json  # Prettier config
```

#### Root package.json

```json
{
  "name": "student-and-class-management-website-app",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "format": "turbo run format"
  },
  "devDependencies": {
    "turbo": "^2.0.9"
  },
  "packageManager": "npm@10.8.1"
}
```

#### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": { "cache": false },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "lint": { "outputs": [] },
    "format": { "outputs": [] }
  }
}
```

#### tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node"]
  }
}
```

#### .prettierrc.json

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all"
}
```

#### ESLint Config (apps/api/eslint.config.js)

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { projectService: false },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  prettier,
);
```

---

### 1.2 Setup Express Server + Mongoose

#### Entry Point (apps/api/src/index.ts)

```typescript
import { createServer } from "./server";
import { connectToDatabase } from "./config/database";
import { env } from "./config/env";

const start = async () => {
  try {
    await connectToDatabase();
    const app = createServer();
    app.listen(env.PORT, () => {
      console.log(`🚀 API server listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server", error);
    process.exit(1);
  }
};

void start();
```

#### Server Configuration (apps/api/src/server.ts)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import './models'; // Register all Mongoose models

export const createServer = () => {
  const app = express();

  // Middleware stack
  app.use(cors({ origin: process.env.CLIENT_URL ?? '*', credentials: true }));
  app.use(helmet());
  app.use(express.json());
  app.use(morgan('dev'));

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // API routes
  app.use('/api', apiRouter);

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
```

#### Database Connection (apps/api/src/config/database.ts)

```typescript
import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) return;

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.MONGODB_URI);
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB", error);
    throw error;
  }
};
```

#### Environment Validation (apps/api/src/config/env.ts)

```typescript
import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration", parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
```

---

### 1.3 Setup Middleware (CORS, Helmet, Morgan)

#### Middleware Stack trong server.ts

```typescript
// CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CLIENT_URL ?? '*',
  credentials: true,
}));

// Helmet - Security headers
app.use(helmet());

// Body parser
app.use(express.json());

// Morgan - HTTP request logging
app.use(morgan('dev'));
```

| Middleware | Chức năng |
|------------|-----------|
| CORS | Cho phép frontend gọi API từ domain khác |
| Helmet | Thêm security headers (XSS, CSP, etc.) |
| Morgan | Log HTTP requests (method, url, status, time) |
| express.json() | Parse JSON request body |

---

### 1.4 Setup MongoDB Atlas

#### Yêu cầu

- Tài khoản MongoDB Atlas (cluster M0 miễn phí)
- Whitelist IP trong Security > Network Access
- Connection string format:

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

#### .env.example

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/student-management
JWT_SECRET=change-me
CLIENT_URL=http://localhost:5173
```

---

### 1.5 Model User

#### Schema Definition (apps/api/src/models/user.model.ts)

```typescript
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

// Indexes for performance
userSchema.index({ status: 1 });
userSchema.index({ role: 1, status: 1 });

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model<User>('User', userSchema);
```

#### User Fields

| Field | Type | Description |
|-------|------|-------------|
| email | String | Email đăng nhập (unique) |
| passwordHash | String | Mật khẩu đã hash |
| role | Enum | ADMIN / TEACHER / STUDENT |
| status | Enum | PENDING / ACTIVE / LOCKED |
| studentId | ObjectId | Liên kết với Student |
| teacherId | ObjectId | Liên kết với Teacher |
| approvedBy | ObjectId | Admin đã duyệt |
| approvedAt | Date | Thời gian duyệt |
| lockedAt | Date | Thời gian khóa |
| lockedReason | String | Lý do khóa |

---


## PHẦN 2: AUTHENTICATION SYSTEM

### 2.1 API /api/auth/register

#### Route Definition (apps/api/src/routes/auth.routes.ts)

```typescript
import { Router } from "express";
import { getProfile, login, register } from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { validateRequest } from "../middlewares/validateRequest";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", requireAuth(), getProfile);

export const authRoutes = router;
```

#### Validation Schema (apps/api/src/schemas/auth.schema.ts)

```typescript
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
  .max(64, "Mật khẩu không quá 64 ký tự");

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    password: passwordSchema,
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).default("STUDENT"),
    studentId: z.string().optional(),
    teacherId: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    password: passwordSchema,
  }),
});
```

#### Controller (apps/api/src/controllers/auth.controller.ts)

```typescript
import type { RequestHandler } from 'express';
import { UserModel } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken } from '../utils/jwt';

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password, role, studentId, teacherId } = req.body;

  // Check existing user
  const existing = await UserModel.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email đã được sử dụng' });
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({
    email,
    passwordHash,
    role,
    studentId: studentId ?? null,
    teacherId: teacherId ?? null,
  });

  res.status(201).json({
    id: user._id,
    email: user.email,
    role: user.role,
  });
});
```

---

### 2.2 API /api/auth/login

```typescript
export const login: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  // Validate credentials
  if (!user) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  // Check account status
  if (user.status === 'PENDING') {
    return res.status(403).json({
      message: 'Tài khoản đang chờ duyệt. Vui lòng liên hệ quản trị viên.',
      code: 'ACCOUNT_PENDING',
    });
  }

  if (user.status === 'LOCKED') {
    return res.status(403).json({
      message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
      code: 'ACCOUNT_LOCKED',
    });
  }

  // Generate JWT token
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
  });

  res.json({
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});
```

---

### 2.3 API /api/auth/me

```typescript
export const getProfile: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await UserModel.findById(req.user.sub);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user._id,
    email: user.email,
    role: user.role,
  });
});
```

---

### 2.4 JWT Authentication (sign, verify)

#### JWT Utilities (apps/api/src/utils/jwt.ts)

```typescript
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string;  // User ID
  role: string; // User role
};

const ACCESS_TOKEN_EXPIRES_IN = "2h";

export const signAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
```

#### JWT Flow

```
1. User login với email/password
2. Server verify credentials
3. Server tạo JWT với payload { sub: userId, role: userRole }
4. Client lưu token vào localStorage
5. Client gửi token trong header: Authorization: Bearer <token>
6. Server verify token với middleware requireAuth
```

---

### 2.5 bcrypt Password Hashing

#### Password Utilities (apps/api/src/utils/password.ts)

```typescript
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
```

| Function | Input | Output |
|----------|-------|--------|
| hashPassword | plain password | hashed string |
| comparePassword | plain password + hash | boolean |

---

### 2.6 Middleware requireAuth

```typescript
import type { RequestHandler } from "express";
import { verifyAccessToken, type JwtPayload } from "../utils/jwt";

export const requireAuth = (): RequestHandler => (req, res, next) => {
  const header = req.headers.authorization;
  
  // Check Bearer token format
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token) as JwtPayload;
    req.user = payload; // Attach user info to request
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
```

---

### 2.7 Middleware requireRole

```typescript
export const requireRole =
  (...roles: string[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
```

#### Sử dụng trong Routes

```typescript
// Chỉ ADMIN được truy cập
router.use(requireRole('ADMIN'));

// ADMIN hoặc TEACHER được truy cập
router.get('/stats', requireRole('ADMIN', 'TEACHER'), getStats);

// Tất cả authenticated users
router.get('/profile', requireAuth(), getProfile);
```

---

### 2.8 Global Error Handler

```typescript
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.flatten(),
    });
  }

  // Handle MongoDB duplicate key error
  const dupErr = err as { code?: number; keyValue?: Record<string, unknown> };
  if (dupErr.code === 11000) {
    const keyValue = dupErr.keyValue;
    const fields = keyValue ? Object.keys(keyValue) : [];
    const message = fields.length
      ? `Duplicate value for ${fields.join(', ')}`
      : 'Duplicate key error';
    return res.status(409).json({ message, fields: keyValue });
  }

  // Log and return generic error
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal server error' });
};
```

#### Error Response Format

| Status | Type | Response |
|--------|------|----------|
| 400 | Validation Error | `{ message, errors: { fieldErrors, formErrors } }` |
| 401 | Unauthorized | `{ message: "Unauthorized" }` |
| 403 | Forbidden | `{ message: "Forbidden" }` |
| 404 | Not Found | `{ message: "Endpoint not found" }` |
| 409 | Conflict | `{ message: "Duplicate value for...", fields }` |
| 500 | Server Error | `{ message: "Internal server error" }` |

---

## PHẦN 3: BACKEND APIs

### 3.1 API /api/users (Admin quản lý tài khoản)

#### Routes (apps/api/src/routes/user.routes.ts)

```typescript
import { Router } from 'express';
import {
  listUsers, getUser, approveUser, lockUser, 
  unlockUser, linkAccount, deleteUser, getUnlinkedRecords,
} from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.use(requireAuth());
router.use(requireRole('ADMIN')); // Chỉ ADMIN

router.get('/', validateRequest(listUsersSchema), listUsers);
router.get('/unlinked', getUnlinkedRecords);
router.get('/:id', validateRequest(getUserSchema), getUser);
router.put('/:id/approve', validateRequest(approveUserSchema), approveUser);
router.put('/:id/lock', validateRequest(lockUserSchema), lockUser);
router.put('/:id/unlock', validateRequest(unlockUserSchema), unlockUser);
router.put('/:id/link', validateRequest(linkAccountSchema), linkAccount);
router.delete('/:id', validateRequest(deleteUserSchema), deleteUser);

export const userRoutes = router;
```

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Danh sách users (filter, pagination) |
| GET | /api/users/unlinked | Lấy students/teachers chưa liên kết |
| GET | /api/users/:id | Chi tiết user |
| PUT | /api/users/:id/approve | Duyệt tài khoản PENDING |
| PUT | /api/users/:id/lock | Khóa tài khoản |
| PUT | /api/users/:id/unlock | Mở khóa tài khoản |
| PUT | /api/users/:id/link | Liên kết với Student/Teacher |
| DELETE | /api/users/:id | Xóa tài khoản |

#### Controller Functions

```typescript
// List users with pagination
export const listUsers: RequestHandler = asyncHandler(async (req, res) => {
  const { status, role, page = 1, pageSize = 20, search } = req.query;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (role) filter.role = role;
  if (search) filter.email = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(pageSize);

  const [items, total] = await Promise.all([
    UserModel.find(filter)
      .select('-passwordHash')
      .populate('studentId', 'mssv fullName email')
      .populate('teacherId', 'employeeId fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize)),
    UserModel.countDocuments(filter),
  ]);

  res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
});

// Approve pending user
export const approveUser: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId, teacherId } = req.body;

  const user = await UserModel.findById(id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  if (user.status !== 'PENDING') {
    return res.status(400).json({ message: 'Chỉ có thể duyệt tài khoản đang chờ' });
  }

  const updateData = {
    status: 'ACTIVE',
    approvedBy: req.user?.sub,
    approvedAt: new Date(),
    ...(studentId && { studentId }),
    ...(teacherId && { teacherId }),
  };

  const updated = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
  res.json({ message: 'Đã duyệt tài khoản thành công', user: updated });
});

// Lock user account
export const lockUser: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await UserModel.findById(id);
  if (user?.role === 'ADMIN') {
    return res.status(400).json({ message: 'Không thể khóa tài khoản Admin' });
  }

  const updated = await UserModel.findByIdAndUpdate(
    id,
    { status: 'LOCKED', lockedAt: new Date(), lockedReason: reason },
    { new: true },
  );

  res.json({ message: 'Đã khóa tài khoản', user: updated });
});
```

---

### 3.2 API /api/me/* (Student xem thông tin cá nhân, điểm)

#### Routes (apps/api/src/routes/me.routes.ts)

```typescript
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import {
  getMyProfile, getMyGrades, getMyEnrollments,
  getMyDashboard, getAvailableSemesters, exportMyGrades, getMyCharts,
} from '../controllers/me.controller';

const router = Router();
router.use(requireAuth());

router.get('/profile', getMyProfile);
router.get('/grades', validateRequest(getMyGradesSchema), getMyGrades);
router.get('/enrollments', validateRequest(getMyEnrollmentsSchema), getMyEnrollments);
router.get('/dashboard', getMyDashboard);
router.get('/semesters', getAvailableSemesters);
router.get('/grades/export', exportMyGrades);
router.get('/charts', validateRequest(getMyChartsSchema), getMyCharts);

export default router;
```

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/me/profile | Thông tin sinh viên |
| GET | /api/me/grades | Điểm số (pagination, filter) |
| GET | /api/me/enrollments | Môn học đã đăng ký |
| GET | /api/me/dashboard | Dashboard data |
| GET | /api/me/semesters | Danh sách học kỳ |
| GET | /api/me/grades/export | Xuất PDF bảng điểm |
| GET | /api/me/charts | Dữ liệu biểu đồ |

#### Controller Example

```typescript
// GET /api/me/profile
export const getMyProfile: RequestHandler = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.sub);
  
  if (!user?.studentId) {
    return res.status(404).json({ message: 'Tài khoản chưa liên kết với sinh viên' });
  }

  const student = await StudentModel.findById(user.studentId).populate('classId');
  res.json(student);
});

// GET /api/me/dashboard
export const getMyDashboard: RequestHandler = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.sub);
  const student = await StudentModel.findById(user.studentId).populate('classId');
  
  const enrollments = await EnrollmentModel.find({ studentId: user.studentId });
  const grades = await GradeModel.find({ enrollmentId: { $in: enrollments.map(e => e._id) } });

  // Calculate GPA
  const totalCredits = enrollments.reduce((sum, e) => sum + e.courseId.credits, 0);
  const gpa = calculateGPA(grades);

  res.json({
    profile: { fullName: student.fullName, mssv: student.mssv, className: student.classId?.name },
    stats: { totalEnrollments: enrollments.length, totalCredits, gpa },
    recentGrades: grades.slice(0, 5),
  });
});
```

---

### 3.3 API /api/dashboard/stats

#### Routes (apps/api/src/routes/dashboard.routes.ts)

```typescript
import { Router } from 'express';
import { getStats, getRecentActivities, getChartData } from '../controllers/dashboard.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();
router.use(requireAuth());

router.get('/stats', requireRole('ADMIN', 'TEACHER'), getStats);
router.get('/recent-activities', requireRole('ADMIN', 'TEACHER'), getRecentActivities);
router.get('/charts', requireRole('ADMIN', 'TEACHER'), getChartData);

export const dashboardRoutes = router;
```

#### Controller

```typescript
export const getStats: RequestHandler = asyncHandler(async (req, res) => {
  let studentFilter = {};
  let classFilter = {};
  let courseFilter = {};

  // Apply teacher scope filtering
  if (req.user) {
    const scope = await getTeacherAccessScope(req.user);
    if (scope) {
      studentFilter = { classId: { $in: scope.classIds } };
      classFilter = { homeroomTeacherId: scope.teacherId };
      courseFilter = { teacherId: scope.teacherId };
    }
  }

  const [totalStudents, totalClasses, totalCourses] = await Promise.all([
    StudentModel.countDocuments(studentFilter),
    ClassModel.countDocuments(classFilter),
    CourseModel.countDocuments(courseFilter),
  ]);

  res.json({ totalStudents, totalClasses, totalCourses });
});
```

---

### 3.4 API /api/dashboard/charts

```typescript
export const getChartData: RequestHandler = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit ?? 10);
  const teacherScope = await getTeacherAccessScope(req.user);

  const [gradeDistribution, studentsByClass, enrollmentTrend, coursePopularity] =
    await Promise.all([
      getGradeDistribution(teacherScope),
      getStudentsByClass(teacherScope, limit),
      getEnrollmentTrend(teacherScope),
      getCoursePopularity(teacherScope, limit),
    ]);

  res.json({
    gradeDistribution,  // { excellent, good, average, poor, total }
    studentsByClass,    // [{ className, count }]
    enrollmentTrend,    // [{ month, count }]
    coursePopularity,   // [{ courseCode, courseName, enrollmentCount }]
  });
});
```

#### Chart Data Types

```typescript
type GradeDistribution = {
  excellent: number; // ≥8
  good: number;      // ≥6.5 and <8
  average: number;   // ≥5 and <6.5
  poor: number;      // <5
  total: number;
};

type StudentsByClass = { className: string; classCode: string; count: number };
type EnrollmentTrend = { month: string; count: number };
type CoursePopularity = { courseCode: string; courseName: string; enrollmentCount: number };
```

---


## PHẦN 4: FRONTEND SETUP

### 4.1 Setup Vite + React + TypeScript

#### Vite Config (apps/web/vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@tanstack/react-table', '@tanstack/table-core'],
    force: true,
  },
});
```

#### TypeScript Config (apps/web/tsconfig.json)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"]
}
```

#### Main Entry (apps/web/src/main.tsx)

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
```

#### Package Dependencies

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@tanstack/react-query": "^5.59.14",
    "@tanstack/react-table": "^8.21.3",
    "axios": "^1.7.7",
    "clsx": "^2.1.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.2",
    "react-router-dom": "^6.28.3",
    "recharts": "^3.5.0",
    "zod": "^3.23.8"
  }
}
```

---

### 4.2 Setup Tailwind CSS + Professional Theme

#### Tailwind Config (apps/web/tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        edu: {
          // Core backgrounds
          background: '#F8FAFC',
          surface: '#FFFFFF',
          muted: '#F1F5F9',
          
          // Primary - Navy blue
          primary: '#1E3A5F',
          'primary-light': '#2D5A8C',
          'primary-hover': '#15294A',
          
          // Accent - Teal
          accent: '#0D9488',
          'accent-light': '#14B8A6',
          
          // Text colors
          ink: '#0F172A',
          'ink-light': '#475569',
          'ink-muted': '#94A3B8',
          
          // Semantic colors
          success: '#059669',
          warning: '#D97706',
          error: '#DC2626',
          info: '#0284C7',
          
          // Dark theme
          'dark-bg': '#0C1222',
          'dark-surface': '#1A2332',
          'dark-text': '#F1F5F9',
          'dark-border': '#334155',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'focus-ring': '0 0 0 3px rgba(30, 58, 95, 0.2)',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

#### CSS Components (apps/web/src/index.css)

```css
@layer components {
  /* Cards */
  .edu-card {
    @apply bg-edu-surface border border-edu-border rounded-lg p-5 md:p-6;
    @apply shadow-card transition-shadow duration-200;
  }

  /* Buttons */
  .edu-btn {
    @apply inline-flex items-center justify-center gap-2;
    @apply px-4 py-2.5 text-sm font-semibold rounded-lg;
    @apply border transition-all duration-150;
  }

  .edu-btn--primary {
    @apply bg-edu-primary text-white border-edu-primary;
    @apply hover:bg-edu-primary-hover shadow-sm hover:shadow-md;
  }

  .edu-btn--accent {
    @apply bg-edu-accent text-white border-edu-accent;
    @apply hover:bg-edu-accent-hover;
  }

  /* Inputs */
  .edu-input {
    @apply w-full px-3.5 py-2.5 text-sm rounded-lg;
    @apply bg-edu-surface border border-edu-border;
    @apply focus:outline-none focus:ring-2 focus:ring-edu-primary/20;
  }

  /* Stat Cards */
  .edu-stat-card {
    @apply relative overflow-hidden rounded-lg p-5 md:p-6;
    @apply transition-all duration-200 shadow-card;
  }

  .edu-stat-card--primary { @apply bg-edu-primary text-white; }
  .edu-stat-card--accent { @apply bg-edu-accent text-white; }
}
```

---

### 4.3 AppLayout (Sidebar Navigation)

#### Layout Component (apps/web/src/layouts/AppLayout.tsx)

```tsx
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../lib/authHooks';
import { useTheme } from '../lib/themeHooks';
import type { UserRole } from '../lib/authContext';

type NavItem = {
  label: string;
  path: string;
  roles?: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/' },
  // Admin/Teacher items
  { label: 'Quản lý sinh viên', path: '/students', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Quản lý lớp học', path: '/classes', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Quản lý môn học', path: '/courses', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Quản lý điểm', path: '/grades', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Báo cáo', path: '/reports', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Quản lý tài khoản', path: '/users', roles: ['ADMIN'] },
  // Student items
  { label: 'Hồ sơ cá nhân', path: '/profile', roles: ['STUDENT'] },
  { label: 'Điểm của tôi', path: '/my-grades', roles: ['STUDENT'] },
  { label: 'Môn học của tôi', path: '/my-courses', roles: ['STUDENT'] },
];

export const AppLayout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter nav items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen flex bg-edu-background dark:bg-edu-dark-bg">
      {/* Sidebar */}
      <aside className={clsx(
        'sticky top-0 h-screen edu-sidebar transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
      )}>
        {/* Logo */}
        <Link to="/" className="block px-2 py-3">
          <div className="font-display text-2xl font-extrabold text-white">
            Edu<span className="text-emerald-300">Manager</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                'flex items-center rounded-lg px-4 py-2.5',
                isActive ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10',
              )}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div className="mt-auto">
          {user && (
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-sm font-semibold text-white">{user.email}</p>
              <p className="text-xs text-white/70">
                {user.role === 'ADMIN' && 'Quản trị viên'}
                {user.role === 'TEACHER' && 'Giảng viên'}
                {user.role === 'STUDENT' && 'Sinh viên'}
              </p>
            </div>
          )}
          <button onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-6 py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
```

---

### 4.4 Auth Context (login state, user info)

#### Context Types (apps/web/src/lib/authContext.ts)

```typescript
import { createContext } from 'react';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
```

#### Auth Provider (apps/web/src/lib/auth.tsx)

```tsx
import { useState, useEffect, type ReactNode } from 'react';
import { apiClient } from './api';
import { AuthContext, type User, type UserRole } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ accessToken: string; user: User }>(
      '/auth/login', { email, password }
    );
    const { accessToken, user: userData } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (email: string, password: string, role: UserRole = 'STUDENT') => {
    await apiClient.post('/auth/register', { email, password, role });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth/sign-in';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### Auth Hooks (apps/web/src/lib/authHooks.ts)

```typescript
import { useContext } from 'react';
import { AuthContext, type UserRole } from './authContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, isLoading } = useAuth();

  if (isLoading) return { isAuthorized: false, isLoading: true };
  if (!user) return { isAuthorized: false, isLoading: false };
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { isAuthorized: false, isLoading: false };
  }
  return { isAuthorized: true, isLoading: false };
}
```

---

### 4.5 Protected Routes (chặn truy cập theo role)

#### ProtectedRoute Component (apps/web/src/components/ProtectedRoute.tsx)

```tsx
import { Navigate } from 'react-router-dom';
import { useRequireAuth } from '../lib/authHooks';
import type { UserRole } from '../lib/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthorized, isLoading } = useRequireAuth(allowedRoles);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="edu-card">
          <p className="text-lg font-semibold">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return <>{children}</>;
};
```

#### Router Configuration (apps/web/src/router.tsx)

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
// Import pages...

export const router = createBrowserRouter([
  // Public routes
  { path: '/auth/sign-in', element: <SignInPage /> },
  { path: '/auth/register', element: <RegisterPage /> },
  
  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'students',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <StudentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      // Student routes
      {
        path: 'profile',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentProfilePage />
          </ProtectedRoute>
        ),
      },
      // ... more routes
    ],
  },
]);
```

#### Route Access Matrix

| Route | ADMIN | TEACHER | STUDENT |
|-------|-------|---------|---------|
| / (Dashboard) | ✅ | ✅ | ✅ |
| /students | ✅ | ✅ | ❌ |
| /classes | ✅ | ✅ | ❌ |
| /courses | ✅ | ✅ | ❌ |
| /grades | ✅ | ✅ | ❌ |
| /reports | ✅ | ✅ | ❌ |
| /users | ✅ | ❌ | ❌ |
| /profile | ❌ | ❌ | ✅ |
| /my-grades | ❌ | ❌ | ✅ |
| /my-courses | ❌ | ❌ | ✅ |

---


## PHẦN 5: FRONTEND PAGES

### 5.1 Trang SignInPage

```tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../lib/authHooks';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
});

type FormValues = z.infer<typeof schema>;

export const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setError(null);
      await login(values.email, values.password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-edu-primary/5 via-edu-background to-edu-accent/5">
      <form onSubmit={handleSubmit(onSubmit)} className="edu-card w-full max-w-md">
        <h2 className="text-xl font-semibold">Đăng nhập</h2>
        
        {error && (
          <div className="edu-alert edu-alert--error" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="edu-label">Email</label>
            <input type="email" {...register('email')} className="edu-input" />
            {errors.email && <p className="text-edu-error text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <label className="edu-label">Mật khẩu</label>
            <input type="password" {...register('password')} className="edu-input" />
            {errors.password && <p className="text-edu-error text-sm">{errors.password.message}</p>}
          </div>
        </div>

        <button type="submit" className="edu-btn edu-btn--primary w-full mt-6" disabled={isSubmitting}>
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p className="mt-6 text-center text-sm">
          Chưa có tài khoản? <Link to="/auth/register" className="text-edu-primary font-semibold">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
};
```

---

### 5.2 Trang RegisterPage

```tsx
const schema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  confirmPassword: z.string(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const onSubmit = async (values: FormValues) => {
    await registerUser(values.email, values.password, values.role);
    setSuccess(true);
    setTimeout(() => navigate('/auth/sign-in'), 2000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="edu-card w-full max-w-sm">
      <h1 className="text-xl font-bold">Đăng ký tài khoản</h1>

      {success && (
        <div className="edu-alert edu-alert--success">
          Đăng ký thành công! Đang chuyển đến trang đăng nhập...
        </div>
      )}

      <div className="space-y-4">
        <input type="email" {...register('email')} placeholder="Email" className="edu-input" />
        
        <select {...register('role')} className="edu-input">
          <option value="STUDENT">Sinh viên</option>
          <option value="TEACHER">Giảng viên</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>

        <input type="password" {...register('password')} placeholder="Mật khẩu" className="edu-input" />
        <input type="password" {...register('confirmPassword')} placeholder="Xác nhận mật khẩu" className="edu-input" />
      </div>

      <button type="submit" className="edu-btn edu-btn--primary w-full mt-6">
        Đăng ký
      </button>
    </form>
  );
};
```

---

### 5.3 Trang DashboardPage (stats cards)

```tsx
import { useDashboardStats, useRecentActivities } from '../lib/dashboard';
import { useMyDashboard } from '../lib/me';
import { useAuth } from '../lib/authHooks';
import { DataTable } from '../components/DataTable';
import { DashboardChartsSection } from '../components/DashboardCharts';

const METRIC_CONFIG = [
  { key: 'totalStudents', label: 'Sinh viên', variant: 'primary' },
  { key: 'totalClasses', label: 'Lớp học', variant: 'accent' },
  { key: 'totalCourses', label: 'Môn học', variant: 'secondary' },
] as const;

export const DashboardPage = () => {
  const { user } = useAuth();

  // Render different dashboard based on role
  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  }
  return <AdminDashboard />;
};

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities } = useRecentActivities({ page: 1, pageSize: 10 });

  return (
    <section className="space-y-6">
      <header className="edu-card--flat">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm opacity-70">Tổng quan hệ thống quản lý sinh viên</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {METRIC_CONFIG.map(({ key, label, variant }) => (
          <div key={key} className={`edu-stat-card edu-stat-card--${variant}`}>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="text-3xl font-bold mt-1">
              {statsLoading ? '...' : stats?.[key]?.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <DashboardChartsSection />

      {/* Recent Activities */}
      <div className="edu-card">
        <h2 className="text-lg font-semibold mb-4">Hoạt động gần đây</h2>
        <DataTable table={table} isLoading={activitiesLoading} />
      </div>
    </section>
  );
};

const StudentDashboard = () => {
  const { data: dashboard } = useMyDashboard();

  return (
    <section className="space-y-6">
      <header className="edu-card--flat">
        <h1 className="text-2xl font-bold">Xin chào, {dashboard?.profile.fullName}</h1>
        <p className="text-sm">MSSV: {dashboard?.profile.mssv} | Lớp: {dashboard?.profile.className}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="edu-stat-card edu-stat-card--primary">
          <p className="text-sm">Môn đã đăng ký</p>
          <p className="text-3xl font-bold">{dashboard?.stats.totalEnrollments}</p>
        </div>
        <div className="edu-stat-card edu-stat-card--accent">
          <p className="text-sm">Tổng tín chỉ</p>
          <p className="text-3xl font-bold">{dashboard?.stats.totalCredits}</p>
        </div>
        <div className="edu-stat-card edu-stat-card--secondary">
          <p className="text-sm">GPA (thang 10)</p>
          <p className="text-3xl font-bold">{dashboard?.stats.gpa?.toFixed(2)}</p>
        </div>
        <div className="edu-stat-card edu-stat-card--success">
          <p className="text-sm">GPA (thang 4)</p>
          <p className="text-3xl font-bold">{dashboard?.stats.gpa4?.toFixed(2)}</p>
        </div>
      </div>

      <StudentChartsSection />
    </section>
  );
};
```

---

### 5.4 Biểu đồ Dashboard

#### Chart Types

| Biểu đồ | Mô tả | Data Source |
|---------|-------|-------------|
| Grade Distribution | Phân bố điểm (Giỏi/Khá/TB/Yếu) | `/api/dashboard/charts` |
| Students by Class | Số sinh viên theo lớp | `/api/dashboard/charts` |
| Enrollment Trend | Xu hướng đăng ký (6 tháng) | `/api/dashboard/charts` |
| Course Popularity | Môn học phổ biến | `/api/dashboard/charts` |

#### Implementation với Recharts

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Grade Distribution Pie Chart
const GradeDistributionChart = ({ data }) => {
  const chartData = [
    { name: 'Giỏi (≥8)', value: data.excellent, color: '#059669' },
    { name: 'Khá (6.5-8)', value: data.good, color: '#0284C7' },
    { name: 'TB (5-6.5)', value: data.average, color: '#D97706' },
    { name: 'Yếu (<5)', value: data.poor, color: '#DC2626' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%">
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Students by Class Bar Chart
const StudentsByClassChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <XAxis dataKey="classCode" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#1E3A5F" />
    </BarChart>
  </ResponsiveContainer>
);
```

---

### 5.5 Trang UsersPage (Admin duyệt/khóa tài khoản)

```tsx
import { useUsers, useApproveUser, useLockUser, useUnlockUser } from '../lib/users';
import { DataTable } from '../components/DataTable';
import { Pager } from '../components/Pager';

type TabKey = 'PENDING' | 'ACTIVE' | 'LOCKED';

const TABS = [
  { key: 'PENDING', label: 'Chờ duyệt', status: 'PENDING' },
  { key: 'ACTIVE', label: 'Đã kích hoạt', status: 'ACTIVE' },
  { key: 'LOCKED', label: 'Đang khóa', status: 'LOCKED' },
];

export const UsersPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('PENDING');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useUsers({ status: activeTab, page, pageSize: 10 });
  const approveMutation = useApproveUser();
  const lockMutation = useLockUser();
  const unlockMutation = useUnlockUser();

  const columns = [
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Vai trò', cell: (info) => {
      const roleMap = { ADMIN: 'Quản trị', TEACHER: 'Giáo viên', STUDENT: 'Sinh viên' };
      return roleMap[info.getValue()];
    }},
    { id: 'linked', header: 'Liên kết', cell: (info) => {
      const { studentId, teacherId } = info.row.original;
      if (studentId) return `SV: ${studentId.mssv} - ${studentId.fullName}`;
      if (teacherId) return `GV: ${teacherId.employeeId} - ${teacherId.fullName}`;
      return '-';
    }},
    { id: 'actions', header: 'Thao tác', cell: (info) => {
      const user = info.row.original;
      return (
        <div className="flex gap-2">
          {user.status === 'PENDING' && (
            <button onClick={() => handleApprove(user)} className="edu-btn edu-btn--primary">
              Duyệt
            </button>
          )}
          {user.status === 'ACTIVE' && (
            <button onClick={() => handleLock(user)} className="edu-btn edu-btn--danger">
              Khóa
            </button>
          )}
          {user.status === 'LOCKED' && (
            <button onClick={() => handleUnlock(user)} className="edu-btn edu-btn--accent">
              Mở khóa
            </button>
          )}
        </div>
      );
    }},
  ];

  return (
    <section className="space-y-6">
      <header className="edu-card--flat">
        <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
        <p className="text-sm opacity-70">Duyệt, khóa, mở khóa và liên kết tài khoản người dùng</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'edu-btn',
              activeTab === tab.key ? 'edu-btn--primary' : 'edu-btn--ghost'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable table={table} isLoading={isLoading} />
      <Pager page={page} pageSize={10} total={data?.total ?? 0} onChangePage={setPage} />
    </section>
  );
};
```

---

### 5.6 Trang StudentProfilePage & StudentGradesPage

#### StudentProfilePage

```tsx
import { useMyProfile } from '../lib/me';

export const StudentProfilePage = () => {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading) return <div className="edu-loading">Đang tải...</div>;

  return (
    <section className="space-y-6">
      <header className="edu-card--flat">
        <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
      </header>

      <div className="edu-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="edu-label">MSSV</label>
            <p className="text-lg font-semibold">{profile?.mssv}</p>
          </div>
          <div>
            <label className="edu-label">Họ và tên</label>
            <p className="text-lg font-semibold">{profile?.fullName}</p>
          </div>
          <div>
            <label className="edu-label">Email</label>
            <p>{profile?.email}</p>
          </div>
          <div>
            <label className="edu-label">Số điện thoại</label>
            <p>{profile?.phone}</p>
          </div>
          <div>
            <label className="edu-label">Ngày sinh</label>
            <p>{new Date(profile?.dob).toLocaleDateString('vi-VN')}</p>
          </div>
          <div>
            <label className="edu-label">Lớp</label>
            <p>{profile?.classId?.name || 'Chưa phân lớp'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="edu-label">Địa chỉ</label>
            <p>{profile?.address}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
```

#### StudentGradesPage

```tsx
import { useMyGrades, useMySemesters, exportMyGradesPdf } from '../lib/me';

export const StudentGradesPage = () => {
  const [semester, setSemester] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: semesters } = useMySemesters();
  const { data: grades, isLoading } = useMyGrades({ semester, page, pageSize: 10 });

  const handleExportPdf = async () => {
    const blob = await exportMyGradesPdf();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bang-diem.pdf';
    a.click();
  };

  const columns = [
    { accessorKey: 'courseCode', header: 'Mã môn' },
    { accessorKey: 'courseName', header: 'Tên môn học' },
    { accessorKey: 'credits', header: 'Tín chỉ' },
    { accessorKey: 'attendance', header: 'Chuyên cần (10%)' },
    { accessorKey: 'midterm', header: 'Giữa kỳ (30%)' },
    { accessorKey: 'final', header: 'Cuối kỳ (60%)' },
    { accessorKey: 'total', header: 'Tổng kết', cell: (info) => {
      const total = info.getValue();
      return <span className={total >= 5 ? 'text-edu-success' : 'text-edu-error'}>{total?.toFixed(2)}</span>;
    }},
  ];

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="edu-card--flat">
          <h1 className="text-2xl font-bold">Điểm của tôi</h1>
        </div>
        <button onClick={handleExportPdf} className="edu-btn edu-btn--primary">
          Xuất PDF
        </button>
      </header>

      {/* Semester Filter */}
      <select value={semester} onChange={(e) => setSemester(e.target.value)} className="edu-input w-48">
        <option value="">Tất cả học kỳ</option>
        {semesters?.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <DataTable table={table} isLoading={isLoading} />
      <Pager page={page} pageSize={10} total={grades?.total ?? 0} onChangePage={setPage} />
    </section>
  );
};
```

---

### 5.7 Dark Mode Toggle

#### Theme Context (apps/web/src/lib/themeContext.ts)

```typescript
import { createContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);
```

#### Theme Provider (apps/web/src/lib/theme.tsx)

```tsx
import { useState, useEffect, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeContext';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

#### Dark Mode CSS

```css
/* Tailwind config: darkMode: 'class' */

/* Dark mode styles */
html.dark body {
  @apply bg-edu-dark-bg text-edu-dark-text;
}

.dark .edu-card {
  @apply bg-edu-dark-surface border-edu-dark-border;
}

.dark .edu-input {
  @apply bg-edu-dark-surface border-edu-dark-border text-edu-dark-text;
}
```

---

### 5.8 Responsive Design

#### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |

#### Responsive Patterns

```tsx
// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Sidebar collapse on mobile
<aside className={clsx(
  'sticky top-0 h-screen transition-all',
  isCollapsed ? 'w-20' : 'w-64',
  'hidden md:block' // Hide on mobile
)}>

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row items-start md:items-center gap-4">

// Responsive padding
<main className="px-4 md:px-6 lg:px-8 py-6">

// Responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
```

---

### 5.9 Reusable Components

#### DataTable Component

```tsx
export interface DataTableProps<TData> {
  table: Table<TData>;
  minWidth?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  showPagination?: boolean;
  paginationSlot?: React.ReactNode;
}

export function DataTable<TData>({
  table, minWidth = '700px', isLoading, emptyMessage = 'Không có dữ liệu',
  showPagination, paginationSlot,
}: DataTableProps<TData>) {
  if (isLoading) {
    return <div className="edu-loading"><div className="edu-loading-spinner" />Đang tải...</div>;
  }

  const rows = table.getRowModel().rows;
  if (rows.length === 0) {
    return <p className="text-center py-12 text-edu-ink-light">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-edu-border">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead className="bg-edu-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left font-semibold">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-edu-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPagination && paginationSlot}
    </>
  );
}
```

#### Pager Component

```tsx
export function Pager({ page, pageSize, total, onChangePage }: PagerProps) {
  const totalPages = Math.ceil(total / pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav className="flex items-center justify-between" aria-label="Phân trang">
      <div className="text-sm text-edu-ink-light">
        Hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} / {total}
      </div>
      <div className="flex gap-1">
        <button onClick={() => onChangePage(page - 1)} disabled={!canPrev} className="edu-btn edu-btn--ghost">
          ← Trước
        </button>
        {/* Page numbers */}
        <button onClick={() => onChangePage(page + 1)} disabled={!canNext} className="edu-btn edu-btn--ghost">
          Sau →
        </button>
      </div>
    </nav>
  );
}
```

#### FilterSection Component

```tsx
export function FilterSection({
  searchFields, selectedField, searchValue,
  onFieldChange, onSearchChange, onClear,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="edu-card" role="search">
      <div className="flex justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="font-bold">Bộ lọc tìm kiếm</h3>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <select value={selectedField} onChange={(e) => onFieldChange(e.target.value)} className="edu-input">
            {searchFields.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nhập từ khóa..."
            className="edu-input flex-1"
          />
          <button onClick={onClear} className="edu-btn edu-btn--ghost">Xóa bộ lọc</button>
        </div>
      )}
    </div>
  );
}
```

---


## PHẦN 6: DEVOPS

### 6.1 File .env.example

#### Backend (apps/api/.env.example)

```env
# Environment
NODE_ENV=development

# Server
PORT=4000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/student-management

# Authentication
JWT_SECRET=change-me-to-a-secure-random-string

# CORS
CLIENT_URL=http://localhost:5173
```

#### Frontend (apps/web/.env.example)

```env
# API URL
VITE_API_URL=http://localhost:4000/api
```

---

### 6.2 Script Seed Data Mẫu

#### Reset Database (apps/api/src/scripts/reset-database.ts)

```typescript
import { connectToDatabase } from '../config/database.js';
import { ClassModel, CourseModel, StudentModel, EnrollmentModel, GradeModel, UserModel, TeacherModel } from '../models';
import { hashPassword } from '../utils/password.js';

async function resetDatabase() {
  console.log('🔄 Connecting to database...');
  await connectToDatabase();

  console.log('⚠️  WARNING: This will delete ALL data!');
  console.log('🗑️  Dropping all collections...\n');

  const collections = [
    { name: 'Grades', model: GradeModel },
    { name: 'Enrollments', model: EnrollmentModel },
    { name: 'Students', model: StudentModel },
    { name: 'Courses', model: CourseModel },
    { name: 'Classes', model: ClassModel },
    { name: 'Teachers', model: TeacherModel },
    { name: 'Users', model: UserModel },
  ];

  for (const { name, model } of collections) {
    await model.deleteMany({});
    console.log(`✅ Cleared ${name} collection`);
  }

  console.log('\n👤 Creating default admin user...');
  const adminPassword = await hashPassword('admin123');
  await UserModel.create({
    email: 'admin@ptithcm.edu.vn',
    passwordHash: adminPassword,
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  console.log('✅ Admin user created');
  console.log('   Email: admin@ptithcm.edu.vn');
  console.log('   Password: admin123\n');

  console.log('💡 Next: Run npm run seed:csv to populate data');
  process.exit(0);
}

resetDatabase();
```

#### Seed from CSV (apps/api/src/scripts/seed-from-csv.ts)

```typescript
import { connectToDatabase } from '../config/database.js';
import { ClassModel, CourseModel, StudentModel, EnrollmentModel, GradeModel, TeacherModel } from '../models';
import { parseCoursesCSV, extractUniqueClasses, extractUniqueCourses } from './helpers/csv-parser.js';
import { generateStudentsForAllClasses, generateRandomGrade } from './helpers/student-generator.js';
import { generateTeachers } from './helpers/teacher-generator.js';

async function seedFromCSV() {
  console.log('🔄 Connecting to database...');
  await connectToDatabase();

  console.log('📄 Parsing CSV files...');
  const courseRecords = parseCoursesCSV('./ds.csv');
  const uniqueClassCodes = extractUniqueClasses(courseRecords);
  const uniqueCourses = extractUniqueCourses(courseRecords);

  console.log('👨‍🏫 Generating Teachers...');
  const teachers = await TeacherModel.insertMany(generateTeachers(20));

  console.log('🏫 Seeding Classes...');
  const classes = await ClassModel.insertMany(
    uniqueClassCodes.map((code, i) => ({
      code,
      name: generateClassName(code),
      homeroomTeacherId: teachers[i % teachers.length]._id,
    }))
  );

  console.log('📚 Seeding Courses...');
  const courses = await CourseModel.insertMany(
    uniqueCourses.map((course, i) => ({
      ...course,
      teacherId: teachers[i % teachers.length]._id,
    }))
  );

  console.log('👨‍🎓 Generating Students...');
  const students = await StudentModel.insertMany(
    generateStudentsForAllClasses(uniqueClassCodes, 18, 22)
  );

  console.log('📝 Seeding Enrollments...');
  const enrollments = await EnrollmentModel.insertMany(/* ... */);

  console.log('📊 Seeding Grades (80% of enrollments)...');
  const grades = await GradeModel.insertMany(
    enrollments.filter(() => Math.random() < 0.8).map((e) => ({
      enrollmentId: e._id,
      ...generateRandomGrade(),
    }))
  );

  console.log('🎉 Seed completed!');
  console.log(`   - Teachers: ${teachers.length}`);
  console.log(`   - Classes: ${classes.length}`);
  console.log(`   - Courses: ${courses.length}`);
  console.log(`   - Students: ${students.length}`);
  console.log(`   - Enrollments: ${enrollments.length}`);
  console.log(`   - Grades: ${grades.length}`);

  process.exit(0);
}

seedFromCSV();
```

#### NPM Scripts (apps/api/package.json)

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc --project tsconfig.build.json",
    "start": "node dist/index.js",
    "seed:csv": "tsx src/scripts/seed-from-csv.ts",
    "db:reset": "tsx src/scripts/reset-database.ts"
  }
}
```

---

### 6.3 Deploy Backend lên Render/Railway

#### Render Deployment

1. **Tạo Web Service mới** trên render.com
2. **Connect GitHub repository**
3. **Cấu hình:**

```yaml
# render.yaml
services:
  - type: web
    name: student-api
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npm run build -w api
    startCommand: npm run start -w api
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
      - key: MONGODB_URI
        sync: false  # Set manually
      - key: JWT_SECRET
        sync: false  # Set manually
      - key: CLIENT_URL
        value: https://your-frontend.vercel.app
```

#### Railway Deployment

1. **Tạo project mới** trên railway.app
2. **Deploy from GitHub**
3. **Cấu hình:**

```bash
# Root Directory: apps/api
# Build Command: npm run build
# Start Command: npm run start
```

4. **Environment Variables:**
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://...`
   - `JWT_SECRET=your-secret`
   - `CLIENT_URL=https://your-frontend.vercel.app`

---

### 6.4 Deploy Frontend lên Vercel/Netlify

#### Vercel Deployment

1. **Import project** từ GitHub
2. **Cấu hình:**

```json
// vercel.json
{
  "buildCommand": "npm run build -w web",
  "outputDirectory": "apps/web/dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

3. **Environment Variables:**
   - `VITE_API_URL=https://your-api.onrender.com/api`

#### Netlify Deployment

1. **New site from Git**
2. **Build settings:**

```toml
# netlify.toml
[build]
  base = "apps/web"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 6.5 README.md (Hướng dẫn cài đặt)

```markdown
# Website Quản lý Sinh viên và Lớp học

## Tổng quan

- Frontend: React 18, Vite, TanStack Query, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Monorepo: TurboRepo

## Yêu cầu

- Node.js ≥ 20.19
- npm 10+
- MongoDB Atlas hoặc MongoDB local

## Cài đặt

1. Clone repository:
   ```bash
   git clone <url>
   cd student-management
   ```

2. Cài dependencies:
   ```bash
   npm install
   ```

3. Tạo file môi trường:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

4. Cập nhật `apps/api/.env`:
   - `MONGODB_URI`: Connection string MongoDB
   - `JWT_SECRET`: Secret key cho JWT
   - `CLIENT_URL`: URL frontend (http://localhost:5173)

5. Whitelist IP trong MongoDB Atlas (nếu dùng Atlas)

## Chạy Development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Chạy cả frontend và backend |
| `npm run build` | Build production |
| `npm run lint` | Kiểm tra ESLint |
| `npm run format` | Kiểm tra Prettier |

### Backend Scripts

```bash
cd apps/api
npm run db:reset    # Reset database + tạo admin
npm run seed:csv    # Import data từ CSV
```

## Tài khoản mặc định

- Email: admin@ptithcm.edu.vn
- Password: admin123

## Cấu trúc thư mục

```
├── apps/
│   ├── api/          # Backend Express
│   └── web/          # Frontend React
├── docs/             # Documentation
├── package.json      # Root config
└── turbo.json        # TurboRepo config
```
```

---

### 6.6 ARCHITECTURE.md (Mô tả kiến trúc)

```markdown
# Kiến trúc Hệ thống

## Tổng quan

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   MongoDB       │
│   (React SPA)   │     │   (Express API) │     │   (Atlas)       │
│   Port: 5173    │     │   Port: 4000    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Backend Architecture

```
apps/api/src/
├── config/           # Database, env configuration
├── controllers/      # Business logic handlers
├── middlewares/      # Auth, validation, error handling
├── models/           # Mongoose schemas
├── routes/           # Express routers
├── schemas/          # Zod validation schemas
├── utils/            # Helper functions (JWT, bcrypt)
├── scripts/          # Seed, reset database
├── index.ts          # Entry point
└── server.ts         # Express app setup
```

## Frontend Architecture

```
apps/web/src/
├── components/       # Reusable components
│   ├── DataTable/
│   ├── FilterSection/
│   └── Pager/
├── layouts/          # AppLayout with sidebar
├── lib/              # API client, contexts, hooks
│   ├── api.ts        # Axios client
│   ├── auth.tsx      # AuthProvider
│   ├── authHooks.ts  # useAuth, useUser
│   └── theme.tsx     # ThemeProvider
├── pages/            # Page components
├── router.tsx        # React Router config
├── main.tsx          # Entry point
└── index.css         # Tailwind styles
```

## Authentication Flow

```
1. User đăng nhập (email/password)
2. Backend verify → tạo JWT token
3. Frontend lưu token vào localStorage
4. Axios interceptor attach token vào header
5. Backend middleware verify token
6. Protected routes check role
```

## Database Schema

```
Users ──────┬──────▶ Students
            │
            └──────▶ Teachers

Classes ◀────────── Students
    │
    └──────────────▶ Enrollments ◀── Courses
                          │
                          └────────▶ Grades
```

## API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Auth | POST /auth/register, /login, GET /auth/me |
| Users | GET/PUT/DELETE /users/* (Admin only) |
| Students | CRUD /students/* |
| Classes | CRUD /classes/* |
| Courses | CRUD /courses/* |
| Enrollments | CRUD /enrollments/* |
| Grades | CRUD /grades/* |
| Dashboard | GET /dashboard/stats, /charts |
| Me | GET /me/profile, /grades, /dashboard |
```

---

## TỔNG KẾT

### Data Flow Summary

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │  Pages  │───▶│  Hooks  │───▶│  API    │───▶│ Axios   │       │
│  │         │    │(TanStack│    │ Client  │    │Intercept│       │
│  └─────────┘    │ Query)  │    └─────────┘    └────┬────┘       │
└────────────────────────────────────────────────────┼─────────────┘
                                                     │
                                              HTTP + JWT Token
                                                     │
┌────────────────────────────────────────────────────▼─────────────┐
│                         BACKEND                                   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │ Routes  │───▶│Middleware│───▶│Controller│───▶│ Model   │       │
│  │         │    │(Auth,   │    │         │    │(Mongoose)│       │
│  └─────────┘    │Validate)│    └─────────┘    └────┬────┘       │
└────────────────────────────────────────────────────┼─────────────┘
                                                     │
                                              Mongoose ODM
                                                     │
┌────────────────────────────────────────────────────▼─────────────┐
│                       MONGODB ATLAS                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │  Users  │  │Students │  │ Classes │  │ Courses │             │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                          │
│  │Teachers │  │Enrolls  │  │ Grades  │                          │
│  └─────────┘  └─────────┘  └─────────┘                          │
└──────────────────────────────────────────────────────────────────┘
```

### Summarized Flow

```
UI → API Hooks → Axios → Express Routes → Middleware → Controller → Mongoose → MongoDB
```

---

## CÂU HỎI GỢI Ý (Next Actions)

1. **Muốn tìm hiểu sâu hơn về phần nào?**
   - Authentication flow chi tiết
   - Database schema và indexes
   - Frontend state management
   - Deployment configuration

2. **Muốn implement thêm tính năng?**
   - Export báo cáo Excel/PDF
   - Notification system
   - Real-time updates với WebSocket
   - Email verification

3. **Muốn optimize performance?**
   - Caching strategies
   - Database query optimization
   - Frontend lazy loading
   - API response compression

4. **Muốn cải thiện security?**
   - Rate limiting
   - Input sanitization
   - HTTPS configuration
   - Audit logging

---

*Tài liệu được tạo tự động từ codebase analysis*
