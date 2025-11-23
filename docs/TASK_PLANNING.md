# Kế hoạch phân công công việc - 1 tháng (4 người)

**Dựa trên REQUIREMENTS.md - Đồ án Website Quản lý Sinh viên và Lớp học**

**Cập nhật lần cuối: 2025-01-23**

---

## 📊 Tổng quan tiến độ

### Đã hoàn thành: 4/8 yêu cầu bắt buộc (50%)

### Đang hoạt động: ✅ Backend API + Frontend UI + Database

---

## Mapping với yêu cầu đề tài

### ✅ Yêu cầu BẮT BUỘC (phải hoàn thành)

#### ✅ HOÀN THÀNH (4/8)

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

#### 🚧 ĐANG PHÁT TRIỂN (4/8)

- [x] **Quản lý sinh viên**: CRUD (họ tên, MSSV, ngày sinh, email, SĐT, **địa chỉ**), tìm kiếm, phân trang
  - ✅ Backend API hoàn chỉnh
  - ✅ Frontend UI với React Table
  - ✅ CRUD operations (Create, Read, Update, Delete)
  - ✅ Pagination
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

- [ ] **Quản lý điểm**: Nhập điểm (chuyên cần, giữa kỳ, cuối kỳ), tính điểm TB môn & TB học kỳ
  - ✅ Backend API có sẵn
  - ✅ Database có 552 điểm số
  - ❌ Frontend UI chưa hoàn thiện
  - ❌ Tính điểm TB chưa implement

- [ ] **Báo cáo**: Xuất Excel/PDF
  - ❌ Chưa implement

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

## 🎯 Refactoring đã hoàn thành (2025-01-23)

### ✅ DataTable Component Consolidation

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

### ✅ FilterSection Component Implementation

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

**Files Created:**

- `apps/web/src/components/FilterSection/FilterSection.tsx`
- `apps/web/src/components/FilterSection/index.ts`

**Files Modified:**

- `apps/web/src/components/DataTable/DataTable.tsx`
- `apps/web/src/pages/StudentsPage.tsx`
- `apps/web/src/pages/ClassesPage.tsx`
- `apps/web/src/pages/CoursesPage.tsx`
- `apps/web/eslint.config.js`

---

## 📝 Công việc cần làm tiếp theo

### Ưu tiên cao (Tuần này)

1. ✅ Test chức năng CRUD sinh viên trên UI
2. ✅ Hoàn thiện UI quản lý lớp học
3. ✅ Hoàn thiện UI quản lý môn học
4. ⬜ Implement chức năng gán sinh viên vào lớp

### Ưu tiên trung bình (Tuần sau)

5. ⬜ Hoàn thiện UI quản lý điểm
6. ⬜ Implement tính điểm TB
7. ⬜ Implement UI cho sinh viên role
8. ⬜ Implement UI cho giảng viên role

### Ưu tiên thấp (2 tuần sau)

9. ⬜ Implement báo cáo Excel/PDF
10. ⬜ Deploy lên hosting cloud
11. ⬜ Implement các tính năng nâng cao

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
