# Kế hoạch phân công công việc - 1 tháng (4 người)

**Dựa trên REQUIREMENTS.md - Đồ án Website Quản lý Sinh viên và Lớp học**

**Cập nhật lần cuối: 2025-01-24**

---

## 📊 Tổng quan tiến độ

### Đã hoàn thành: 5/8 yêu cầu bắt buộc (62.5%)

### Đang hoạt động: ✅ Backend API + Frontend UI + Database

---

## Mapping với yêu cầu đề tài

### ✅ Yêu cầu BẮT BUỘC (phải hoàn thành)

#### ✅ HOÀN THÀNH (5/8)

- [x] **Auth & Phân quyền**: Admin, Giảng viên, Sinh viên
  - ✅ JWT authentication
  - ✅ Login/Register pages
  - ✅ Role-based access control (ADMIN, TEACHER, STUDENT)
  - ✅ Protected routes
  - ✅ Password hashing với bcrypt
  - ✅ MongoDB user model với roles

- [x] **Dashboard**: Số lớp, số sinh viên, số môn học
  - ✅ Dashboard page với tổng quan hệ thống
  - ✅ Hiển thị số lượng sinh viên, lớp học, môn học
  - ✅ Sidebar navigation
  - ✅ User info display

- [x] **Database Setup**: MongoDB Atlas
  - ✅ 57 sinh viên
  - ✅ 8 giáo viên
  - ✅ 8 lớp học
  - ✅ 20 môn học
  - ✅ 552 điểm số
  - ✅ 552 đăng ký môn học

- [x] **Quản lý sinh viên**: CRUD (họ tên, MSSV, ngày sinh, email, SĐT, **địa chỉ**), tìm kiếm, phân trang
  - ✅ Backend API hoàn chỉnh
  - ✅ Frontend UI với React Table
  - ✅ CRUD operations (Create, Read, Update, Delete)
  - ✅ Pagination với Pager component
  - ✅ Search và filter với FilterSection component
  - ✅ Single input + dropdown cho search fields (MSSV, Họ tên, Email, SĐT, Địa chỉ)
  - ✅ Additional filters: Class select, Date range (ngày sinh)
  - ✅ Debounce 300ms, URL sync

- [x] **Quản lý lớp & môn**: CRUD lớp học, CRUD môn học, gán sinh viên
  - ✅ Backend API có sẵn
  - ✅ Database có 8 lớp và 20 môn học
  - ✅ Frontend UI hoàn chỉnh với DataTable component
  - ✅ CRUD operations cho lớp học (ClassesPage)
  - ✅ CRUD operations cho môn học (CoursesPage)
  - ✅ Client-side filtering với FilterSection component
  - ✅ Search fields: Mã lớp, Tên lớp, GVCN (ClassesPage)
  - ✅ Search fields: Mã môn, Tên môn (CoursesPage)
  - ❌ Chức năng gán sinh viên vào lớp chưa có

#### 🚧 ĐANG PHÁT TRIỂN (2/8)

- [x] **Quản lý điểm**: Nhập điểm (chuyên cần, giữa kỳ, cuối kỳ), tính điểm TB môn & TB học kỳ
  - ✅ Backend API hoàn chỉnh với pagination
  - ✅ Database có 552 điểm số
  - ✅ Frontend UI hoàn thiện (GradesPage)
  - ✅ Tính điểm TB tự động: `0.1*CC + 0.3*GK + 0.6*CK`
  - ✅ Tính điểm TB học kỳ có trọng số theo tín chỉ
  - ✅ Phân loại điểm: Giỏi/Khá/Trung bình/Yếu
  - ✅ CRUD operations với modal form
  - ✅ Validation: điểm 0-10, required fields
  - ✅ Filter section với:
    - Search: Tên sinh viên, MSSV
    - Lọc theo lớp (dropdown)
    - Lọc theo môn học (dropdown)
    - Lọc theo học kỳ (2 dropdowns: HK1/HK2/HK3 + Năm)
  - ✅ Pagination với Pager component
  - ✅ Responsive table (minWidth: 900px)
  - ✅ Permission check: chỉ ADMIN/TEACHER mới sửa được
  - ✅ Color-coded grades (xanh/xanh dương/vàng/đỏ)
  - ✅ Hover tooltip hiển thị phân loại

- [x] **Báo cáo**: Xuất Excel/PDF
  - ✅ Backend API hoàn chỉnh với Excel/PDF export
  - ✅ Frontend UI với form filters (lớp, môn, học kỳ, format)
  - ✅ Endpoint: `GET /api/reports/export?classId=...&courseId=...&semester=...&format=excel|pdf`
  - ✅ Endpoint: `GET /api/reports/available-courses?classId=...` (lấy môn có điểm theo lớp)
  - ✅ ExcelJS library cho Excel generation
  - ✅ PDFKit library cho PDF generation
  - ✅ Smart filter: khi chọn lớp, dropdown môn chỉ hiển thị môn có điểm
  - ✅ File download tự động với tên: `bao-cao-diem-{timestamp}.xlsx|pdf`
  - ✅ Permission check: chỉ ADMIN/TEACHER mới xuất được
  - ✅ Error handling: hiển thị "Không tìm thấy dữ liệu điểm" nếu không có dữ liệu

- [ ] **Sinh viên role**: Xem thông tin cá nhân và điểm
  - ✅ Role đã được setup
  - ❌ UI cho sinh viên chưa có

- [ ] **Giảng viên role**: Quản lý điểm, xem danh sách sinh viên
  - ✅ Role đã được setup
  - ❌ UI cho giảng viên chưa có

- [ ] **Deploy**: Lên hosting cloud
  - ❌ Chưa deploy

---

### ⭐ Yêu cầu NÂNG CAO (khuyến khích)

- [x] **Tìm kiếm nâng cao**: Lọc theo nhiều tiêu chí
  - ✅ Backend API hỗ trợ filter theo: q, classId, mssv, fullName, email, phone, address, dobFrom, dobTo
  - ✅ Frontend có search và filter UI

- [ ] **Import/Export**: Import sinh viên từ Excel, Export PDF kèm biểu đồ
  - ❌ Chưa implement

- [ ] **2FA**: Xác thực 2 lớp (mô phỏng qua email)
  - ❌ Chưa implement

- [x] **Reset password**: Qua email (mô phỏng)
  - ✅ Script reset password đã tạo: `apps/api/src/scripts/reset-admin-password.ts`
  - ⚠️ Chưa có UI cho user tự reset

- [ ] **Thông báo**: Gửi thông báo điểm mới
  - ❌ Chưa implement

- [x] **Responsive & Dark Mode**: Desktop/mobile, chế độ sáng/tối
  - ✅ Responsive design với Tailwind CSS
  - ✅ Neobrutalism design system
  - ✅ Dark mode đã implement đầy đủ

- [ ] **Phân tích học tập**: Phân loại Giỏi/Khá/Yếu, biểu đồ tiến bộ
  - ❌ Chưa implement

- [ ] **Docker & CI/CD**: Đóng gói Docker, GitHub Actions
  - ❌ Chưa implement

---

## 🐛 Lỗi đã sửa

1. ✅ **Màn hình trắng** - Fixed TypeScript config và module imports
2. ✅ **API server không khởi động** - Fixed missing dependencies
3. ✅ **Không thể đăng nhập** - Fixed password reset
4. ✅ **Dev server không khởi động** - Fixed missing `@vitejs/plugin-react`
5. ✅ **"Cannot access 'deleteMutate' before initialization"** - Fixed variable hoisting trong StudentsPage
6. ✅ **ESLint parsing error** - Fixed `tsconfigRootDir` trong `apps/web/eslint.config.js`

---

## 🎯 Refactoring đã hoàn thành

### ✅ DataTable Component Consolidation (2025-01-23)

- ✅ Tạo shared DataTable component với:
  - Header background: `bg-nb-lilac` (đã update từ `bg-nb-lemon`)
  - Text color: `text-nb-paper` cho header
  - Rounded corners ở 4 góc table
  - Dark mode support đầy đủ
  - `overflowYHidden` prop cho StudentsPage pagination
- ✅ Refactor 3 pages sử dụng DataTable:
  - StudentsPage (với pagination)
  - ClassesPage (không pagination)
  - CoursesPage (không pagination)
- ✅ Giảm ~222 dòng code duplicate

### ✅ FilterSection Component Implementation (2025-01-23)

- ✅ Tạo reusable FilterSection component với:
  - Single input + dropdown thay vì nhiều input fields
  - Smooth animation: `transition-all duration-300 ease-in-out`
  - Max-height + opacity cho collapse/expand mượt mà
  - Support `additionalFilters` prop cho custom filters
  - Dark mode support
  - `defaultOpen = false` (mặc định đóng)
- ✅ Refactor StudentsPage:
  - Thay thế 126 dòng inline filter UI
  - 5 search fields: MSSV, Họ tên, Email, SĐT, Địa chỉ
  - Additional filters: Class select, Date range
  - Debounce 300ms, URL sync
  - Server-side filtering
- ✅ Thêm filter vào ClassesPage:
  - 3 search fields: Mã lớp, Tên lớp, GVCN
  - Client-side filtering
  - Hiển thị "Tìm thấy: X / Y lớp học"
- ✅ Thêm filter vào CoursesPage:
  - 2 search fields: Mã môn, Tên môn
  - Client-side filtering
  - Hiển thị "Tìm thấy: X / Y môn học"
- ✅ 0 TypeScript errors, 0 ESLint errors

### ✅ Pager Component & GradesPage Implementation (2025-01-24)

- ✅ Tạo shared Pager component:
  - Sliding window hiển thị tối đa 7 số trang
  - Nút Previous/Next với disabled states
  - Neobrutalism design system
  - TypeScript interface `PagerProps`
  - Reusable cho mọi trang có pagination
- ✅ Refactor StudentsPage:
  - Sử dụng Pager component thay vì local function
  - Giảm ~60 dòng code duplicate
- ✅ Implement GradesPage hoàn chỉnh:
  - API integration layer (`apps/web/src/lib/grades.ts`)
  - Types: `GradeListItem`, `ListGradesResponse`, `UpsertGradePayload`
  - React Query hooks: `useGradesQuery()`, `useUpsertGrade()`
  - Helper functions: `computeGradeClassification()`, `computeSemesterAverage()`
  - Full CRUD với modal form
  - Validation: Zod schema, điểm 0-10
  - Filter section với grid layout tiết kiệm không gian
  - Semester picker: 2 dropdowns (HK1/HK2/HK3 + Năm)
  - Pagination với Pager component
  - Responsive table (minWidth: 900px)
  - Permission check: ADMIN/TEACHER only
- ✅ Fix backend API:
  - Sửa response format từ array → pagination object
  - Thêm pagination support (page, pageSize)
  - Thêm filter theo semester
- ✅ Fix sidebar width inconsistency:
  - Thêm `flex-shrink-0` để ngăn sidebar co lại
  - Thêm `min-w-20` (collapsed) và `min-w-64` (expanded)
  - Đảm bảo width đồng nhất trên tất cả các trang
- ✅ Optimize GradesPage table:
  - Giảm column widths từ 1050px → 860px
  - Giảm minWidth từ 1200px → 900px
  - Cột "Môn học" chỉ hiển thị mã, hover để xem full
  - Không cần scroll ngang trên màn hình 1366px

### ✅ Report Export Feature Implementation (2025-01-24)

- ✅ Backend implementation:
  - Tạo `apps/api/src/controllers/report.controller.ts` với 2 endpoints
  - Endpoint 1: `GET /api/reports/export` - Xuất Excel/PDF
    - Query params: `classId`, `courseId`, `semester`, `format` (excel|pdf)
    - ExcelJS: Tạo file Excel với header, styling, data
    - PDFKit: Tạo file PDF landscape với bảng dữ liệu
    - Response: File download với Content-Disposition header
  - Endpoint 2: `GET /api/reports/available-courses` - Lấy môn có điểm theo lớp
    - Query param: `classId` (bắt buộc)
    - Logic: Lọc từ GradeModel → populate courseId → distinct
    - Response: Array of courses có điểm trong lớp đó
  - Tạo `apps/api/src/routes/report.routes.ts` với middleware chain:
    - `requireAuth()` - Yêu cầu đăng nhập
    - `requireRole('ADMIN', 'TEACHER')` - Chỉ ADMIN/TEACHER
    - `validateRequest()` - Validate query params
  - Tạo `apps/api/src/schemas/report.schema.ts` - Zod validation schema
  - Fix import: Đổi từ `import * as ExcelJS` → `import ExcelJS` (CommonJS)
  - Fix import: Đổi từ `import * as PDFDocument` → `import PDFDocument` (CommonJS)
  - Cài đặt dependencies: `exceljs`, `pdfkit`, `@types/pdfkit`

- ✅ Frontend implementation:
  - Tạo `apps/web/src/lib/reports.ts` - API integration layer
    - Function `exportReport()` - Gọi API export với params
    - Function `downloadFile()` - Tạo blob URL và trigger download
    - Type `ExportReportParams` - TypeScript interface
  - Tạo `apps/web/src/pages/ReportsPage.tsx` - UI hoàn chỉnh
    - Form với 4 fields:
      - Lớp (dropdown, optional)
      - Môn học (dropdown, optional, smart filter)
      - Học kỳ (text input, optional)
      - Format (radio buttons: Excel/PDF)
    - React Query hooks:
      - `useQuery` lấy danh sách lớp
      - `useQuery` lấy danh sách môn (all)
      - `useQuery` lấy danh sách môn theo lớp (conditional)
    - Smart filter logic:
      - Khi chọn lớp → gọi API `/api/reports/available-courses`
      - Dropdown môn chỉ hiển thị môn có điểm trong lớp đó
      - Khi bỏ chọn lớp → reset môn, hiển thị tất cả môn
    - Export handler:
      - Validate form
      - Gọi `exportReport()` API
      - Trigger file download
      - Error handling: hiển thị toast message
    - Loading state: Disable button khi đang export
    - Permission: Route protected với `ProtectedRoute` (ADMIN/TEACHER only)
  - Cập nhật `apps/web/src/router.tsx`:
    - Thêm route `/reports` với `ProtectedRoute` wrapper
    - Allowed roles: `['ADMIN', 'TEACHER']`

- ✅ Bug fixes:
  - Fix 500 error: Sửa import ExcelJS/PDFKit từ namespace import → default import
  - Fix smart filter: Khi chọn lớp, reset courseId để tránh lỗi "không có dữ liệu"
  - Fix UI: Hiển thị hint text "(Chỉ hiển thị môn có điểm)" khi chọn lớp

**Files Created:**

- `apps/api/src/controllers/report.controller.ts`
- `apps/api/src/routes/report.routes.ts`
- `apps/api/src/schemas/report.schema.ts`
- `apps/web/src/lib/reports.ts`
- `apps/web/src/pages/ReportsPage.tsx`

**Files Modified:**

- `apps/api/src/routes/index.ts` - Thêm report routes
- `apps/web/src/router.tsx` - Thêm reports route
- `apps/api/package.json` - Cài đặt exceljs, pdfkit, @types/pdfkit

---

## 📝 Công việc cần làm tiếp theo

### Ưu tiên cao (Tuần này)

1. ✅ Test chức năng CRUD sinh viên trên UI
2. ✅ Hoàn thiện UI quản lý lớp học
3. ✅ Hoàn thiện UI quản lý môn học
4. ✅ Hoàn thiện UI quản lý điểm
5. ✅ Implement tính điểm TB
6. ⬜ Implement chức năng gán sinh viên vào lớp

### Ưu tiên trung bình (Tuần sau)

7. ⬜ Implement UI cho sinh viên role (xem điểm cá nhân)
8. ⬜ Implement UI cho giảng viên role (quản lý điểm lớp mình dạy)
9. ⬜ Implement báo cáo Excel/PDF

### Ưu tiên thấp (2 tuần sau)

10. ⬜ Deploy lên hosting cloud
11. ⬜ Implement các tính năng nâng cao (Import/Export, 2FA, Thông báo, Phân tích học tập)

---

## 🔧 Technical Stack (Đã triển khai)

### Backend

- ✅ Node.js + Express
- ✅ MongoDB + Mongoose
- ✅ JWT Authentication
- ✅ bcrypt password hashing
- ✅ TypeScript
- ✅ ES Modules

### Frontend

- ✅ React 18.3.1
- ✅ Vite 7.1.10
- ✅ TypeScript 5.9.3
- ✅ TanStack React Table 8.21.3
- ✅ TanStack React Query v5
- ✅ React Router DOM
- ✅ React Hook Form + Zod
- ✅ Tailwind CSS
- ✅ Neobrutalism design system

### DevOps

- ✅ TurboRepo monorepo
- ✅ MongoDB Atlas
- ❌ Docker (chưa có)
- ❌ CI/CD (chưa có)

---

## 📞 Liên hệ & Hỗ trợ

- **Database**: MongoDB Atlas - `student-management`
- **API**: http://localhost:4000
- **Web**: http://localhost:5173
- **Admin**: admin@example.com / admin123
