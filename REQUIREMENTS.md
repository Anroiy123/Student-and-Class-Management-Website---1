# Đồ án : Website Quản lý Sinh viên và Lớp học

## Thông tin chung

- Đơn vị: Học viện Công nghệ Bưu chính Viễn thông
- Khoa: Công nghệ Thông tin 2
- Học phần: Lập Trình Website
- Trình độ đào tạo: Đại học
- Hình thức đào tạo: Chính quy

## Yêu cầu đề tài

- **Số lượng sinh viên**: 3-4
- **Mục tiêu**: Xây dựng ứng dụng web quản lý sinh viên, lớp học, môn học và điểm số.

## Chức năng chính

### a. Quản lý sinh viên

- Thêm, sửa, xóa thông tin sinh viên (họ tên, MSSV, ngày sinh, email, số điện thoại, địa chỉ).
- Tìm kiếm sinh viên theo MSSV, tên hoặc lớp học.
- Hiển thị danh sách sinh viên dưới dạng bảng (có phân trang hoặc cuộn).

### b. Quản lý lớp học & môn học

- CRUD lớp học (tên lớp, mã lớp, sĩ số).
- CRUD môn học (tên môn, mã môn, số tín chỉ).
- Gán sinh viên vào lớp học/môn học.

### c. Quản lý điểm

- Nhập điểm cho sinh viên theo từng môn học (chuyên cần, giữa kỳ, cuối kỳ).
- Tính điểm trung bình môn, điểm trung bình học kỳ.
- Xuất báo cáo điểm (Excel/PDF).

### d. Tài khoản & phân quyền

- Đăng ký, đăng nhập.
- Phân quyền: Admin, Giảng viên, Sinh viên.
  - Admin: Quản lý hệ thống (thêm/sửa lớp, môn, giảng viên).
  - Giảng viên: Quản lý điểm, xem danh sách sinh viên.
  - Sinh viên: Xem thông tin cá nhân và điểm.

### e. Triển khai

- Deploy hệ thống lên Heroku, Render, Vercel, Netlify hoặc hosting của trường.

## Yêu cầu giao diện

- **Trang chủ**: Thanh menu (Dashboard, Quản lý sinh viên, Quản lý lớp học, Quản lý điểm) và thông tin tổng quan (số lớp, số sinh viên, số môn học).
- **Trang danh sách sinh viên**: Bảng hiển thị (STT, MSSV, Họ tên, Lớp, Email, SĐT), nút Sửa/Xóa mỗi sinh viên, nút Thêm sinh viên mở form nhập.
- **Trang quản lý điểm**: Danh sách sinh viên theo lớp/môn, form nhập điểm (Giữa kỳ, Cuối kỳ, Tổng kết), nút xuất báo cáo ra Excel/PDF.
- **Trang đăng nhập/đăng ký**: Form tài khoản/mật khẩu, giao diện đơn giản dễ sử dụng.

## Công nghệ & yêu cầu kỹ thuật

- **Frontend**: ReactJS, HTML, CSS, JavaScript. [CLO1]
- **Backend**: NodeJS/Express hoặc PHP/Laravel, kết nối MySQL/MongoDB. [CLO1]
- **Kỹ thuật bắt buộc**:
  - CRUD (Create, Read, Update, Delete).
  - Quản lý state trên React (`useState`, `useEffect`).
  - Gọi API để lấy dữ liệu.
- **Bảo mật**: Có chức năng đăng nhập và phân quyền cơ bản. [CLO2]
- **Triển khai**: Deploy hệ thống trên nền tảng cloud. [CLO2]
- **Báo cáo nhóm**: Mô tả mô hình kiến trúc, phân công công việc, demo sản phẩm.

## Phần nâng cao khuyến khích

- Tìm kiếm nâng cao (lọc theo nhiều tiêu chí: tên, lớp, điểm trung bình, khoảng ngày sinh).
- Import/Export dữ liệu: import sinh viên từ Excel, export báo cáo ra PDF kèm biểu đồ thống kê.
- Quản lý tài khoản nâng cao: xác thực 2 lớp (2FA), reset mật khẩu qua email (mô phỏng).
- Hệ thống thông báo: gửi thông báo khi có điểm mới hoặc thay đổi thông tin.
- Responsive & Dark Mode: hoạt động tốt trên desktop/mobile, có chế độ sáng/tối.
- Phân tích dữ liệu học tập: thống kê phân loại Giỏi/Khá/Yếu, biểu đồ tiến bộ.
- Triển khai nâng cao: đóng gói Docker, tích hợp CI/CD với GitHub Actions.
