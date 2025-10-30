# Hướng dẫn kết nối Frontend với MongoDB

## ✅ Đã hoàn thành:

### 1. **API Service** (`apps/web/src/lib/axios.ts`)
- Tạo axios instance với base URL từ `.env`
- Tự động thêm JWT token vào request
- Xử lý lỗi 401 (unauthorized)

### 2. **Student Service** (`apps/web/src/services/student.service.ts`)
- `getStudents()` - Lấy danh sách sinh viên (có phân trang, tìm kiếm)
- `getStudent(id)` - Lấy chi tiết 1 sinh viên
- `createStudent(data)` - Tạo sinh viên mới
- `updateStudent(id, data)` - Cập nhật sinh viên
- `deleteStudent(id)` - Xóa sinh viên

### 3. **React Query Hooks** (`apps/web/src/hooks/useStudents.ts`)
- `useStudents(params)` - Fetch danh sách sinh viên
- `useCreateStudent()` - Mutation để tạo sinh viên
- `useUpdateStudent()` - Mutation để cập nhật
- `useDeleteStudent()` - Mutation để xóa
- Tự động invalidate cache sau mỗi mutation

### 4. **StudentsPageNew** (`apps/web/src/pages/StudentsPageNew.tsx`)
- UI hoàn chỉnh với TailwindCSS
- Kết nối với React Query để fetch real data
- Tìm kiếm theo MSSV, tên, lớp
- Phân trang
- CRUD operations (Create, Read, Update, Delete)
- Loading states & Error handling

### 5. **Environment Variables**
- `apps/web/.env` - Cấu hình API URL
- `apps/web/.env.example` - Template cho team

---

## 🚀 Cách chạy:

### Bước 1: Đảm bảo API đang chạy

```powershell
# Terminal 1: Chạy API
npm run dev --workspace=apps/api
```

**Kiểm tra:**
- API chạy ở: `http://localhost:4000`
- MongoDB đã kết nối thành công
- Thấy log: `✅ Connected to MongoDB`

### Bước 2: Chạy Frontend

```powershell
# Terminal 2: Chạy Web
npm run dev --workspace=apps/web
```

**Hoặc chạy cả 2 cùng lúc:**

```powershell
npm run dev
```

### Bước 3: Mở trình duyệt

Truy cập: `http://localhost:5173/students`

---

## 📋 Tính năng:

### ✅ Đã có:
1. **Hiển thị danh sách** - Lấy từ MongoDB qua API
2. **Tìm kiếm** - Theo MSSV, tên, lớp
3. **Phân trang** - 10 items/trang
4. **Thêm sinh viên** - Modal form validation
5. **Sửa sinh viên** - Cập nhật thông tin
6. **Xóa sinh viên** - Có confirm dialog
7. **Loading states** - Spinner khi fetch data
8. **Error handling** - Hiển thị lỗi kết nối API/MongoDB

### 📊 Stats Dashboard:
- Tổng số sinh viên
- Trang hiện tại / Tổng số trang
- Số kết quả hiển thị

---

## 🔧 Cấu trúc code:

```
apps/web/src/
├── lib/
│   └── axios.ts              # Axios instance với interceptors
├── services/
│   └── student.service.ts    # API calls cho Students
├── hooks/
│   └── useStudents.ts        # React Query hooks
└── pages/
    └── StudentsPageNew.tsx   # UI trang Students (kết nối MongoDB)
```

---

## ⚠️ Lưu ý:

### 1. **API phải chạy trước Frontend**
- API: `http://localhost:4000`
- Web: `http://localhost:5173`

### 2. **MongoDB phải kết nối thành công**
Check file `apps/api/.env`:
```
MONGODB_URI=mongodb+srv://hop_admin:Vanhop0410@cluster0.oee9kli.mongodb.net/student-management?retryWrites=true&w=majority
```

### 3. **CORS đã được config**
Backend cho phép Frontend (`http://localhost:5173`) gọi API.

### 4. **Nếu chưa có data**
Thêm sinh viên đầu tiên qua:
- UI: Click "Thêm sinh viên"
- Hoặc API: POST `http://localhost:4000/api/students`

---

## 🐛 Troubleshooting:

### Lỗi: "Không thể kết nối đến server"
**Nguyên nhân:** API chưa chạy hoặc sai URL

**Giải pháp:**
1. Check API đang chạy: `npm run dev --workspace=apps/api`
2. Check file `apps/web/.env` có `VITE_API_URL=http://localhost:4000`

### Lỗi: MongoDB connection failed
**Nguyên nhân:** IP chưa whitelist hoặc sai credentials

**Giải pháp:**
1. Check MongoDB Atlas đã thêm `0.0.0.0/0` vào Network Access
2. Check username/password trong `apps/api/.env`

### Lỗi: 401 Unauthorized
**Nguyên nhân:** Chưa đăng nhập hoặc token hết hạn

**Giải pháp:**
1. Đăng nhập tại `/auth/sign-in`
2. Hoặc bỏ authentication check tạm (dev only)

---

## 📝 Test thử:

### 1. Thêm sinh viên mới:
```
MSSV: 2021601234
Họ tên: Nguyễn Văn Test
Email: test@student.edu.vn
SĐT: 0912345678
Ngày sinh: 2003-01-01
Địa chỉ: 123 Test Street
Lớp: CNTT-K60
```

### 2. Tìm kiếm:
- Nhập "2021" → Tìm theo MSSV
- Nhập "Nguyễn" → Tìm theo tên
- Nhập "CNTT" → Tìm theo lớp

### 3. Sửa/Xóa:
- Click "Sửa" để cập nhật
- Click "Xóa" để xóa (có confirm)

---

## 🎯 Kết quả mong đợi:

✅ Frontend lấy data thật từ MongoDB
✅ Thêm/Sửa/Xóa sinh viên thành công
✅ Tìm kiếm hoạt động real-time
✅ Phân trang tự động
✅ UI responsive, đẹp mắt
✅ Error handling tốt

---

**Chúc bạn dev thành công!** 🚀
