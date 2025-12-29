👤 Hải: Quản lý Sinh viên & Lớp học
Backend:

Model Student (mssv, fullName, dob, email, phone, address, classId)
Model Class (code, name, size, homeroomTeacherId)
API CRUD /api/students (thêm, sửa, xóa, lấy chi tiết)
API tìm kiếm sinh viên (theo MSSV, tên, email, lớp)
API phân trang danh sách sinh viên
API CRUD /api/classes
API gán sinh viên vào lớp
Zod validation cho Student, Class
Frontend:

Trang StudentsPage (danh sách sinh viên dạng bảng)
Modal thêm sinh viên
Modal sửa sinh viên
Nút xóa sinh viên (confirm dialog)
Component tìm kiếm sinh viên
Component phân trang
Trang ClassesPage (danh sách lớp học)
Modal thêm/sửa lớp học
Dropdown chọn giảng viên chủ nhiệm

----------------------------------------------------
👤 Hợp: Quản lý Môn học & Đăng ký môn
Backend:

Model Course (code, name, credits, teacherId)
Model Teacher (employeeId, fullName, email, phone, department)
Model Enrollment (studentId, classId, courseId, semester)
API CRUD /api/courses
API CRUD /api/teachers
API CRUD /api/enrollments
API lấy danh sách sinh viên theo môn
API lấy danh sách môn theo sinh viên
API lấy danh sách môn theo lớp
Zod validation cho Course, Teacher, Enrollment
Frontend:

Trang CoursesPage (danh sách môn học)
Modal thêm/sửa môn học
Dropdown chọn giảng viên phụ trách
Trang TeachersPage (danh sách giảng viên) - nếu cần
UI đăng ký môn cho sinh viên
UI xem danh sách sinh viên đã đăng ký môn
Filter môn theo học kỳ
Component chọn học kỳ (HK1/HK2/HK3 + Năm)

----------------------------------------------------
👤 Hùng: Quản lý Điểm & Báo cáo
Backend:

Model Grade (enrollmentId, attendance, midterm, final, total, gpa4, letterGrade)
API CRUD /api/grades
API /api/grades/statistics (thống kê điểm)
Logic tính điểm TB môn: total = attendance*0.1 + midterm*0.3 + final*0.6
Logic tính điểm TB học kỳ (theo tín chỉ)
Logic chuyển đổi thang 10 → thang 4 (GPA)
Logic xếp loại (Giỏi ≥8, Khá ≥6.5, TB ≥5, Yếu <5)
API /api/reports/export?format=excel (ExcelJS)
API /api/reports/export?format=pdf (PDFKit)
API /api/reports/available-courses (lấy môn có điểm)
Frontend:

Trang GradesPage (danh sách điểm)
Filter điểm theo lớp, môn, học kỳ
Modal nhập điểm (chuyên cần, giữa kỳ, cuối kỳ)
Hiển thị điểm TB tự động tính
Component thống kê phân loại (Giỏi/Khá/TB/Yếu)
Biểu đồ phân bố điểm (Pie chart)
Trang ReportsPage
Form chọn filter (lớp, môn, học kỳ, format)
Nút xuất Excel
Nút xuất PDF

----------------------------------------------------
👤 Long: Auth, Dashboard & DevOps
Backend:

Setup monorepo (TurboRepo, TypeScript, ESLint, Prettier)
Setup Express server + Mongoose
Setup middleware (CORS, Helmet, Morgan)
Setup MongoDB Atlas
Model User (email, passwordHash, role, status, studentId, teacherId)
API /api/auth/register
API /api/auth/login
API /api/auth/me
JWT authentication (sign, verify)
bcrypt password hashing
Middleware requireAuth
Middleware requireRole('ADMIN', 'TEACHER', 'STUDENT')
Global error handler
API /api/users (Admin quản lý tài khoản)
API /api/me/* (Student xem thông tin cá nhân, điểm)
API /api/dashboard/stats (tổng sinh viên, lớp, môn)
API /api/dashboard/charts (dữ liệu biểu đồ)
Frontend:

Setup Vite + React + TypeScript
Setup Tailwind CSS + Neobrutalism theme
AppLayout (Sidebar navigation)
Menu hiển thị theo role
Auth Context (login state, user info)
Protected Routes (chặn truy cập theo role)
Trang SignInPage
Trang RegisterPage
Trang DashboardPage (stats cards)
Biểu đồ Dashboard (sinh viên theo lớp, xu hướng đăng ký, môn phổ biến)
Trang UsersPage (Admin duyệt/khóa tài khoản)
Trang StudentProfilePage (Student xem thông tin)
Trang StudentGradesPage (Student xem điểm)
Dark Mode toggle
Responsive design
Reusable components (DataTable, Modal, FilterSection, Pager)
DevOps:

File .env.example
Script seed data mẫu
Deploy Backend lên Render/Railway
Deploy Frontend lên Vercel/Netlify
README.md (hướng dẫn cài đặt)
ARCHITECTURE.md (mô tả kiến trúc)