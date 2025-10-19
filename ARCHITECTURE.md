# Kiến trúc dự án

Tài liệu này mô tả chi tiết cấu trúc dự án hiện tại, công nghệ được sử dụng và vai trò của từng thành phần trong hệ thống Website Quản lý Sinh viên và Lớp học.

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
│       │   ├── layouts         # Khung layout chung
│       │   ├── lib             # Query client (TanStack Query)
│       │   ├── pages           # Các trang UI (Dashboard, Students, …)
│       │   ├── index.css       # Tailwind entry
│       │   ├── main.tsx        # Điểm vào React
│       │   └── router.tsx      # Định nghĩa routes SPA
│       ├── public              # Tài nguyên tĩnh
│       ├── dist                # Kết quả build Vite
│       ├── tailwind.config.ts  # Cấu hình Tailwind
│       ├── postcss.config.cjs  # Cấu hình PostCSS
│       ├── package.json        # Scripts, dependencies frontend
│       └── tsconfig.json       # TypeScript frontend
├── package.json                # Khai báo workspaces & script chung
├── package-lock.json           # Khoá phiên bản npm
├── turbo.json                  # Nhiệm vụ TurboRepo (dev, build, lint…)
├── tsconfig.base.json          # Base config TypeScript cho toàn dự án
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

- **AppLayout**: header, navigation, vùng hiển thị nội dung.
- **Pages**: các trang Dashboard, Students, Classes, Courses, Grades, Reports, SignIn (hiện hiển thị placeholder, sẵn sàng kết nối API).
- **State & data fetching**: QueryClient (TanStack Query) cấu hình mặc định trong `lib/queryClient.ts`.
- **Routing**: React Router cấu trúc nested route, `/auth/sign-in` tách riêng.
- **Form**: sử dụng React Hook Form kết hợp Zod cho form đăng nhập, có thể tái sử dụng cho CRUD khác.

## Quy trình chạy chính

1. `npm run dev` – Turbo khởi động đồng thời:
   - Vite dev server (frontend) tại `http://localhost:5173`.
   - Express server (backend) tại `http://localhost:4000`, tự kết nối MongoDB thông qua `MONGODB_URI`.
2. Lint (`npm run lint`) kiểm tra cả hai workspace.
3. Build (`npm run build`):
   - API: `tsc` xuất `dist/`.
   - Web: Vite tạo `dist/` sẵn sàng deploy static.

## Lộ trình phát triển tiếp theo (gợi ý)

1. Hoàn thiện UI/UX cho từng trang (bảng dữ liệu, modal, form).
2. Tích hợp API vào frontend thông qua TanStack Query (CRUD students/classes/courses).
3. Bổ sung phân quyền UI theo vai trò.
4. Xây dựng module báo cáo (Excel/PDF) và chức năng import/export.
5. Thiết lập Docker Compose hoặc pipeline deploy (Vercel + Render/Railway).

Tài liệu sẽ được cập nhật khi kiến trúc thay đổi hoặc có thêm thành phần mới.
