# Kiến trúc dự án

Tài liệu này mô tả chi tiết cấu trúc dự án hiện tại, công nghệ được sử dụng và vai trò của từng thành phần trong đồ án hệ thống Website Quản lý Sinh viên và Lớp học.

## Tổng quan công nghệ

- **Frontend (apps/web)**: React 18 (SPA), Vite, React Router, TanStack Query & Table, Tailwind CSS, React Hook Form + Zod.
- **Backend (apps/api)**: Node.js + Express, Mongoose (MongoDB), Zod (validate), JWT (xác thực), bcryptjs (mã hoá mật khẩu).
- **Quản lý dự án**: TurboRepo (monorepo), TypeScript toàn diện, ESLint + Prettier.
- **Cơ sở dữ liệu**: MongoDB Atlas (cluster M0), kết nối thông qua ODM Mongoose.

## Cấu trúc thư mục

```
.
├── apps
│   ├── api
│   │   ├── src
│   │   │   ├── config          # Kết nối DB, đọc biến môi trường
│   │   │   ├── controllers     # Xử lý nghiệp vụ cho từng tài nguyên
│   │   │   ├── middlewares     # JWT, validate, bắt lỗi
│   │   │   ├── models          # Định nghĩa schema Mongoose
│   │   │   ├── routes          # Khai báo endpoint REST
│   │   │   ├── schemas         # Zod schema cho request/body
│   │   │   ├── utils           # Hàm tiện ích (async handler, JWT, bcrypt)
│   │   │   ├── types           # Khai báo mở rộng type Express
│   │   │   ├── index.ts        # Điểm khởi động service
│   │   │   └── server.ts       # Cấu hình Express app
│   │   ├── dist                # Kết quả build (tsc)
│   │   ├── package.json        # Scripts, dependencies backend
│   │   ├── .env & .env.example # Biến môi trường API
│   │   └── tsconfig.*          # Cấu hình TypeScript backend
│   └── web
│       ├── src
│       │   ├── components      # Reusable components (ProtectedRoute)
│       │   ├── layouts         # AppLayout sidebar
│       │   ├── lib             # Auth context, API client, QueryClient
│       │   ├── pages           # Dashboard, Students, Classes, Courses, Grades, Reports, SignIn, RegisterPage
│       │   ├── index.css       # Tailwind + neo-brutalism styles
│       │   ├── main.tsx        # React entry with AuthProvider
│       │   └── router.tsx      # Routes with ProtectedRoute wrappers
│       ├── public              # Tài nguyên tĩnh
│       ├── dist                # Kết quả build Vite
│       ├── .env & .env.example # VITE_API_URL
│       ├── tailwind.config.ts  # Tailwind + neo-brutalism colors/shadows
│       ├── postcss.config.cjs  # Cấu hình PostCSS
│       ├── package.json        # Scripts, dependencies frontend
│       └── tsconfig.json       # TypeScript frontend
├── package.json                # Khai báo workspaces & script chung
├── package-lock.json           # Khoá phiên bản npm
├── turbo.json                  # Nhiệm vụ TurboRepo (dev, build, lint…)
├── tsconfig.base.json          # Base config TypeScript cho toàn dự án
├── ARCHITECTURE.md             # Kiến trúc dự án (file này)
├── README.md                   # Hướng dẫn cài đặt / chạy dự án
├── REQUIREMENTS.md             # Yêu cầu chức năng của đề tài
└── .prettierrc.json            # Quy tắc format
```

## Module backend (apps/api)

- **Auth**: đăng ký/đăng nhập, trả về JWT, middleware `requireAuth`, `requireRole`.
- **Student/Class/Course**: CRUD dữ liệu, phân trang & tìm kiếm.
- **Enrollment**: gán sinh viên vào lớp/môn, tránh trùng (unique index).
- **Grade**: nhập điểm, tính tổng kết (attendance 10%, midterm 30%, final 60%).
- **Report** (placeholder): sẽ dùng để xuất Excel/PDF.
- **Validation**: mọi request được kiểm tra bằng Zod trước khi vào controller.
- **Error handling**: middleware bắt lỗi chung, trả JSON chuẩn hoá.

## Module frontend (apps/web)

- **AppLayout**: Sidebar navigation bên trái với filter menu theo role, hiển thị thông tin user hiện tại.
- **Pages**: Dashboard, Students, Classes, Courses, Grades, Reports, SignIn, RegisterPage.
- **Auth System** (`lib/auth.tsx`, `lib/api.ts`):
  - `AuthProvider` context: quản lý trạng thái user, login/logout/register.
  - `useAuth()` hook: truy cập login/register/logout functions.
  - `useUser()` hook: lấy thông tin user hiện tại.
  - `useRequireAuth(roles)` hook: kiểm tra quyền truy cập cho route.
  - Axios client interceptors: tự động attach JWT token, xử lý lỗi 401.
  - localStorage persistence: lưu token và user info.
- **Protected Routes** (`components/ProtectedRoute.tsx`):
  - Guard route theo role (ADMIN, TEACHER, STUDENT).
  - Loading state khi xác thực.
  - Auto-redirect về sign-in nếu chưa đăng nhập hoặc không đủ quyền.
- **Sign In Page** (`pages/SignInPage.tsx`):
  - Form email/password tích hợp API login thực tế.
  - Error handling & validation.
  - Link đến trang Register.
  - Auto-redirect về Dashboard sau login thành công.
- **Register Page** (`pages/RegisterPage.tsx`):
  - Form email/password/role (dropdown chọn ADMIN/TEACHER/STUDENT).
  - Password confirmation validation.
  - Success message & auto-redirect về Sign In.
- **State & data fetching**: QueryClient (TanStack Query) cấu hình mặc định trong `lib/queryClient.ts`.
- **Routing**: React Router cấu trúc nested route với role-based protection.
- **Form**: sử dụng React Hook Form kết hợp Zod cho form đăng nhập và đăng ký.

## Quy trình chạy chính

1. `npm run dev` – Turbo khởi động đồng thời:
   - Vite dev server (frontend) tại `http://localhost:5173`.
   - Express server (backend) tại `http://localhost:4000`, tự kết nối MongoDB thông qua `MONGODB_URI`.
2. Lint (`npm run lint`) kiểm tra cả hai workspace.
3. Build (`npm run build`):
   - API: `tsc` xuất `dist/`.
   - Web: Vite tạo `dist/` sẵn sàng deploy static.

## Phân quyền và xác thực

### Hệ thống role

- **ADMIN**: Quản trị viên - full quyền truy cập tất cả trang.
- **TEACHER**: Giảng viên - xem/quản lý sinh viên, lớp, môn, điểm.
- **STUDENT**: Sinh viên - chỉ xem Dashboard và Báo cáo.

### Quy trình xác thực

1. User đăng ký tại `/auth/register` với email/password/role.
2. Backend tạo User record với role, hash password bằng bcryptjs.
3. User đăng nhập tại `/auth/sign-in` với email/password.
4. Backend verify password, tạo JWT token (chứa sub, role).
5. Frontend lưu token vào localStorage, store user info.
6. Frontend tự động attach token vào Authorization header mỗi request.
7. Backend verify token, check role với requireAuth() + requireRole() middleware.
8. Protected routes trên frontend check role, redirect về sign-in nếu không đủ quyền.

### Route protection

- **Public routes**: `/auth/sign-in`, `/auth/register`.
- **Protected (all authenticated)**: `/` (Dashboard), `/reports`.
- **Protected (ADMIN + TEACHER)**: `/students`, `/classes`, `/courses`, `/grades`.

### Token lifecycle

- JWT token lưu trong localStorage.
- Mỗi page load, AuthProvider check localStorage, load user info.
- Interceptor tự động attach token.
- Nếu API trả 401, client xóa token và redirect `/auth/sign-in`.
- Logout xóa token từ localStorage, reset user state.

## Lộ trình phát triển tiếp theo

1. ✅ **Thiết kế Neo-brutalism**: Bold borders, offset shadows, vibrant colors trên tất cả components.
2. ✅ **Left sidebar navigation**: Menu bar nằm bên trái, sticky trên scroll.
3. ✅ **Xác thực và phân quyền**: Login/Register, JWT, role-based route protection, conditional menu.
4. Hoàn thiện UI/UX cho từng trang (bảng dữ liệu, modal, form CRUD).
5. Tích hợp API vào frontend thông qua TanStack Query (CRUD students/classes/courses).
6. Xây dựng module báo cáo (Excel/PDF) và chức năng import/export.
7. Thiết lập Docker Compose hoặc pipeline deploy (Vercel + Render/Railway).
8. Refresh token mechanism để duy trì session lâu dài.
9. User profile page & password change.
10. Audit log & activity tracking.

Tài liệu sẽ được cập nhật khi kiến trúc thay đổi hoặc có thêm thành phần mới.
