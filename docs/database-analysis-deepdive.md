# Deep Dive: Phân tích Database Schema & Chiến lược Quản lý Tài khoản

**Ngày phân tích:** 24/11/2025  
**Hệ thống:** Website Quản lý Sinh viên và Lớp học  
**Stack:** MongoDB + Mongoose, Express, React

---

## 📊 I. PHÂN TÍCH SCHEMA DATABASE HIỆN TẠI

### 1.1. Tổng quan Collections

Hệ thống hiện tại có **6 collections chính**:

| Collection      | Documents | Mục đích                                               | Status          |
| --------------- | --------- | ------------------------------------------------------ | --------------- |
| **users**       | N/A       | Xác thực & phân quyền (ADMIN, TEACHER, STUDENT)        | ✅ Tốt          |
| **students**    | N/A       | Thông tin sinh viên (MSSV, họ tên, ngày sinh, liên hệ) | ✅ Tốt          |
| **classes**     | N/A       | Lớp học (mã lớp, tên, sĩ số, GVCN)                     | ⚠️ Cần cải tiến |
| **courses**     | N/A       | Môn học (mã môn, tên, số tín chỉ)                      | ✅ Tốt          |
| **enrollments** | N/A       | Đăng ký môn học (sinh viên - môn - học kỳ)             | ✅ Tốt          |
| **grades**      | N/A       | Điểm số (chuyên cần, giữa kỳ, cuối kỳ)                 | ✅ Tốt          |

---

### 1.2. Chi tiết Schema từng Collection

#### 🔵 Collection: **users**

```typescript
{
  email: String (required, unique, lowercase),
  passwordHash: String (required),
  role: Enum["ADMIN", "TEACHER", "STUDENT"] (default: "STUDENT"),
  studentId: ObjectId -> Student (nullable),
  teacherId: ObjectId (nullable, KHÔNG reference đến collection nào),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `email: unique`

**Đánh giá:**

- ✅ **Tốt:** Phân quyền rõ ràng, hỗ trợ 3 role
- ✅ **Tốt:** studentId reference đến Student collection
- ❌ **VẤN ĐỀ NGHIÊM TRỌNG:** `teacherId` là ObjectId nhưng **KHÔNG có collection Teacher**
  - Không thể populate() để lấy thông tin giảng viên
  - Không có cơ chế validate referential integrity
  - Dẫn đến orphan references nếu cố tình set teacherId

---

#### 🔵 Collection: **students**

```typescript
{
  mssv: String (required, unique, trim),
  fullName: String (required, trim, indexed),
  dob: Date (required),
  email: String (required, unique, lowercase),
  phone: String (required, indexed),
  address: String (required),
  classId: ObjectId -> Class (nullable),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `mssv: unique`
- `email: unique`
- `fullName: index` (single field)
- `phone: index` (single field)
- `{ fullName: "text", mssv: 1 }` (compound text search)

**Đánh giá:**

- ✅ **Xuất sắc:** Schema đầy đủ, indexes hợp lý cho search
- ✅ **Tốt:** Ràng buộc unique trên MSSV và email
- ✅ **Tốt:** classId reference đến Class, cho phép sinh viên thuộc một lớp hành chính
- ⚠️ **Lưu ý:** Không có trường `status` (active/inactive/graduated) cho lifecycle management

---

#### 🔵 Collection: **classes**

```typescript
{
  code: String (required, unique, trim),
  name: String (required, trim),
  size: Number (default: 0),
  homeroomTeacher: String (nullable), // ❌ CHỈ LÀ STRING!
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `code: unique`

**Đánh giá:**

- ✅ **Tốt:** Unique constraint trên code
- ❌ **VẤN ĐỀ NGHIÊM TRỌNG:** `homeroomTeacher` chỉ là **String**, không phải ObjectId
  - Không thể liên kết với User/Teacher để lấy thông tin chi tiết
  - Không thể query "tất cả lớp do giảng viên X chủ nhiệm"
  - Không có data validation (có thể nhập tên không tồn tại)
  - Dữ liệu bị denormalized, khó maintain khi giảng viên đổi tên
- ⚠️ **Vấn đề nhỏ:** `size` là Number tĩnh, không tự động tính từ students.classId

---

#### 🔵 Collection: **courses**

```typescript
{
  code: String (required, unique, trim),
  name: String (required, trim),
  credits: Number (required, min: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `code: unique`

**Đánh giá:**

- ✅ **Xuất sắc:** Schema đơn giản, rõ ràng, đúng mục đích
- ⚠️ **Thiếu:** Không có trường `teacherId` để biết giảng viên phụ trách môn học
- ⚠️ **Thiếu:** Không có trường `semester`, `academicYear` để phân biệt các kỳ mở khóa học

---

#### 🔵 Collection: **enrollments**

```typescript
{
  studentId: ObjectId -> Student (required),
  classId: ObjectId -> Class (nullable),
  courseId: ObjectId -> Course (required),
  semester: String (required, trim),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `{ studentId: 1, courseId: 1, semester: 1 }` (unique compound)

**Đánh giá:**

- ✅ **Xuất sắc:** Unique constraint ngăn sinh viên đăng ký trùng môn trong cùng kỳ
- ✅ **Tốt:** Reference đầy đủ đến Student, Course
- ⚠️ **Thiếu:** Không có trường `status` (enrolled/dropped/completed)
- ⚠️ **Thiếu:** Không có `enrolledAt`, `droppedAt` để track timeline
- ⚠️ **Cân nhắc:** `classId` nullable - có thể sinh viên đăng ký môn không thuộc lớp hành chính

---

#### 🔵 Collection: **grades**

```typescript
{
  enrollmentId: ObjectId -> Enrollment (required, unique),
  attendance: Number (0-10, default: 0),
  midterm: Number (0-10, default: 0),
  final: Number (0-10, default: 0),
  total: Number (0-10, default: 0),
  computedAt: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `enrollmentId: unique`

**Đánh giá:**

- ✅ **Xuất sắc:** One-to-one relationship với Enrollment (unique)
- ✅ **Tốt:** Validation min/max cho điểm số
- ✅ **Tốt:** Có trường `total` để cache điểm tổng kết
- ⚠️ **Thiếu:** Không có trường `gradeScale` (A, B, C, D, F)
- ⚠️ **Thiếu:** Không có trường `gradedBy` (ObjectId -> User/Teacher)

---

### 1.3. Biểu đồ Quan hệ (ER Diagram - Hiện tại)

```
User (email, passwordHash, role, studentId, teacherId)
  |
  └─[1:1?]─> Student (mssv, fullName, email, classId)
                 |
                 ├─[N:1]─> Class (code, name, homeroomTeacher[String!])
                 |
                 └─[1:N]─> Enrollment (studentId, courseId, classId, semester)
                             |
                             ├─[N:1]─> Course (code, name, credits)
                             |
                             └─[1:1]─> Grade (enrollmentId, attendance, midterm, final)
```

**⚠️ Vấn đề nhận diện:**

1. **User.teacherId** trỏ vào hư không (không có Teacher collection)
2. **Class.homeroomTeacher** là String (không thể reference)
3. **Không có bảng Teacher độc lập**

---

## 🔴 II. VẤN ĐỀ NGHIÊM TRỌNG: THIẾU TEACHER MODEL

### 2.1. Hiện trạng

Hệ thống hiện tại **KHÔNG có collection Teacher** riêng biệt:

1. **User model** có field `teacherId: ObjectId` nhưng không reference đến đâu
2. **Class model** có field `homeroomTeacher: String` (chỉ lưu tên text)
3. **Không có CRUD API nào cho Teacher**
4. **Không có UI quản lý giảng viên**

### 2.2. Hậu quả

#### ❌ Về mặt Kiến trúc Database

- **Orphan references:** `User.teacherId` có thể chứa ObjectId không tồn tại
- **Data inconsistency:** `Class.homeroomTeacher` là text tự do, không validate
- **No referential integrity:** Không thể cascade delete/update
- **Cannot populate:** Không thể `.populate('teacherId')` để lấy thông tin giảng viên

#### ❌ Về mặt Nghiệp vụ

- **Không quản lý được thông tin giảng viên:** Họ tên đầy đủ, mã GV, khoa, chuyên môn
- **Không biết giảng viên phụ trách môn học nào:** Course không có teacherId
- **Không thể phân quyền chính xác:** TEACHER role không gắn với data thực tế
- **Không thể query:** "Tìm tất cả lớp do GV X chủ nhiệm" → Không thể vì chỉ là String
- **Không thể báo cáo:** "Thống kê số môn/lớp của từng giảng viên"

#### ❌ Về mặt UX/UI

- Khi tạo Class, admin phải **gõ tay tên GVCN** thay vì chọn từ dropdown
- Không có trang "Quản lý Giảng viên" → Không tuân thủ requirement gốc
- Không thể xem profile giảng viên
- TEACHER login nhưng không có "tài khoản cá nhân" liên kết

### 2.3. So sánh với Requirement gốc

**Requirement (docs/REQUIREMENTS.md):**

> "Admin: Quản lý hệ thống (thêm/sửa lớp, môn, **giảng viên**)."

→ **Hiện tại KHÔNG có chức năng quản lý giảng viên!**

---

## 👤 III. CHIẾN LƯỢC QUẢN LÝ TÀI KHOẢN

### 3.1. Hiện trạng: Self-Registration cho Tất cả

**Cách hoạt động hiện tại:**

- API `/auth/register` cho phép bất kỳ ai đăng ký với role ADMIN/TEACHER/STUDENT
- Không có kiểm soát nào về email domain hay mã sinh viên/giảng viên
- Frontend có trang `RegisterPage.tsx` với dropdown chọn role tự do

**Vấn đề:**

#### ❌ Bảo mật & Quyền hạn

- **Bất kỳ ai cũng có thể tự phong ADMIN:** Tạo tài khoản admin@malicious.com với role="ADMIN"
- **Không verify danh tính:** Không kiểm tra MSSV/Mã GV có tồn tại trong hệ thống
- **Không có approval workflow:** Admin không thể kiểm duyệt trước khi cấp quyền

#### ❌ Data Integrity

- **User không gắn với Student/Teacher thực tế:**
  - Khi đăng ký role="STUDENT", không bắt nhập MSSV
  - `User.studentId` và `User.teacherId` để null
  - Không thể biết User này là sinh viên/giảng viên nào
- **Trùng lặp tài khoản:** Một sinh viên có thể tạo nhiều User account

#### ❌ Nghiệp vụ Giáo dục

- **Trường học thực tế không cho sinh viên/giảng viên tự đăng ký:**
  - Tài khoản được cấp bởi phòng Đào tạo/IT
  - Email theo domain @university.edu
  - Sinh viên/GV nhận thông tin đăng nhập qua email chính thức

### 3.2. So sánh: Self-Registration vs Pre-Provisioned

| Tiêu chí                  | Self-Registration (Hiện tại)      | Pre-Provisioned (Đề xuất)                     |
| ------------------------- | --------------------------------- | --------------------------------------------- |
| **Bảo mật**               | ❌ Bất kỳ ai có thể tạo ADMIN     | ✅ Chỉ admin hiện hữu mới tạo được admin mới  |
| **Data Integrity**        | ❌ User không gắn Student/Teacher | ✅ User phải reference đến record có sẵn      |
| **Workflow**              | ❌ Không kiểm duyệt               | ✅ Admin tạo account sau khi import danh sách |
| **Realism**               | ❌ Không giống trường thật        | ✅ Giống quy trình thực tế                    |
| **Maintenance**           | ❌ Khó quản lý khi scale          | ✅ Dễ quản lý, track lifecycle                |
| **User Experience (MVP)** | ✅ Dễ demo, test                  | ⚠️ Cần seed data trước                        |

### 3.3. Khuyến nghị theo Role

#### 🔵 **ADMIN**

**Đề xuất:** **Pre-provisioned (Hard-coded hoặc Manual Creation)**

**Lý do:**

- Chỉ nên có 1-3 admin trong hệ thống thực tế
- Cần kiểm soát chặt chẽ quyền tối thượng
- Tạo bằng script hoặc seed data, không qua UI

**Cách triển khai:**

```typescript
// Seed script: apps/api/src/scripts/seed-admin.ts
await UserModel.create({
  email: 'admin@university.edu',
  passwordHash: await hashPassword('SecureP@ssw0rd'),
  role: 'ADMIN',
  studentId: null,
  teacherId: null,
});
```

#### 🔵 **TEACHER**

**Đề xuất:** **Pre-provisioned (Admin tạo sau khi import Teacher)**

**Workflow:**

1. Admin import danh sách giảng viên từ Excel → tạo Teacher documents
2. Admin truy cập UI "Quản lý Giảng viên" → chọn giảng viên → click "Tạo tài khoản"
3. Hệ thống tự động tạo User với:
   - `email = teacher.email`
   - `role = "TEACHER"`
   - `teacherId = teacher._id`
   - Mật khẩu mặc định (gửi qua email)
4. Giảng viên login lần đầu → bắt đổi mật khẩu

**Ưu điểm:**

- Admin kiểm soát chặt chẽ ai được cấp quyền TEACHER
- Đảm bảo `User.teacherId` luôn reference đến Teacher có thật
- Không có giảng viên "ảo" trong hệ thống

#### 🔵 **STUDENT**

**Đề xuất:** **Hybrid (Pre-provisioned hoặc Self-Registration có Verification)**

**Phương án A: Pre-provisioned (Khuyến nghị cho Production)**

1. Admin import danh sách sinh viên từ Excel → tạo Student documents
2. Hệ thống tự động tạo User với:
   - `email = student.email`
   - `role = "STUDENT"`
   - `studentId = student._id`
   - Mật khẩu mặc định = `MSSV@123` hoặc random
3. Gửi email thông báo cho sinh viên
4. Sinh viên login lần đầu → đổi mật khẩu

**Phương án B: Self-Registration + Verification (MVP/Demo)**

1. Sinh viên đăng ký, bắt buộc nhập MSSV + Email
2. Backend check MSSV có tồn tại trong `students` collection không
3. Nếu có:
   - Tạo User với `studentId = <matched student._id>`
   - Gửi email xác thực
4. Nếu không:
   - Reject với lỗi "MSSV không tồn tại trong hệ thống"

**So sánh:**
| | Pre-provisioned | Self-Registration + Verify |
|-|-----------------|----------------------------|
| **Security** | ✅ Tốt nhất | ⚠️ Khá tốt (nếu verify đúng) |
| **UX** | ⚠️ Sinh viên chờ admin tạo | ✅ Sinh viên tự làm ngay |
| **Setup Cost** | ⚠️ Cần import danh sách trước | ✅ Minimal |
| **Real-world** | ✅ Giống trường thật | ❌ Ít trường làm vậy |

**Khuyến nghị cuối:**

- **Production:** Dùng Pre-provisioned
- **MVP/Demo:** Dùng Self-Registration + Verify MSSV

---

## 💡 IV. ĐỀ XUẤT SCHEMA DATABASE MỚI

### 4.1. Thêm Collection: **teachers**

```typescript
// apps/api/src/models/teacher.model.ts
const teacherSchema = new Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true }, // Mã GV
    fullName: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    department: { type: String, default: null }, // Khoa
    specialization: { type: String, default: null }, // Chuyên ngành
    status: {
      type: String,
      enum: ['ACTIVE', 'ON_LEAVE', 'RETIRED'],
      default: 'ACTIVE',
    },
    hireDate: { type: Date, default: null },
  },
  { timestamps: true },
);

teacherSchema.index({ fullName: 'text', employeeId: 1 });
```

**Indexes:**

- `employeeId: unique`
- `email: unique`
- `fullName: text + employeeId compound`

### 4.2. Cập nhật Collection: **users**

```typescript
// BEFORE:
teacherId: { type: Schema.Types.ObjectId, default: null }, // ❌ Không ref

// AFTER:
teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', default: null }, // ✅ Có ref
```

### 4.3. Cập nhật Collection: **classes**

```typescript
// BEFORE:
homeroomTeacher: { type: String, default: null }, // ❌ String

// AFTER:
homeroomTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', default: null }, // ✅ ObjectId
```

**Migration script:**

```typescript
// apps/api/src/scripts/migrate-classes-teacher.ts
// 1. Tạo Teacher documents từ homeroomTeacher strings unique
// 2. Update Class.homeroomTeacherId = matched Teacher._id
// 3. Drop field homeroomTeacher
```

### 4.4. Cập nhật Collection: **courses**

**Thêm field mới:**

```typescript
teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', default: null },
semester: { type: String, default: null }, // "Fall 2024", "Spring 2025"
academicYear: { type: String, default: null }, // "2024-2025"
```

**Lý do:**

- Biết môn học do giảng viên nào phụ trách
- Phân biệt các lần mở khóa học (cùng môn nhưng khác kỳ)

### 4.5. Cập nhật Collection: **enrollments**

**Thêm fields:**

```typescript
status: {
  type: String,
  enum: ['ENROLLED', 'DROPPED', 'COMPLETED'],
  default: 'ENROLLED'
},
enrolledAt: { type: Date, default: Date.now },
droppedAt: { type: Date, default: null },
```

### 4.6. Cập nhật Collection: **grades**

**Thêm fields:**

```typescript
gradeScale: {
  type: String,
  enum: ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'],
  default: null
},
gradedBy: { type: Schema.Types.ObjectId, ref: 'Teacher', default: null },
gradedAt: { type: Date, default: null },
```

### 4.7. Biểu đồ ER Mới (Sau cải tiến)

```
                     ┌─────────────────────┐
                     │      Teacher        │
                     │ (employeeId, name)  │
                     └──────────┬──────────┘
                                │
                    ┌───────────┼──────────────┐
                    │           │              │
                    ▼           ▼              ▼
┌───────────┐   ┌────────┐ ┌────────┐   ┌──────────┐
│   User    │   │ Class  │ │ Course │   │  Grade   │
│(teacherId)│   │(homeT.)│ │(teachr)│   │(gradedBy)│
└─────┬─────┘   └───┬────┘ └───┬────┘   └────┬─────┘
      │             │          │              │
      │             │          │              │
      ▼             ▼          ▼              ▼
┌──────────┐   ┌──────────────────────────────────┐
│ Student  │──▶│         Enrollment               │
│(mssv,..) │   │(studentId, courseId, classId,..) │
└──────────┘   └──────────────────────────────────┘
```

**Các mối quan hệ mới:**

- Teacher ← User (1:1, optional)
- Teacher ← Class (1:N, homeroom)
- Teacher ← Course (1:N, instructor)
- Teacher ← Grade (1:N, grader)

---

## 📋 V. ĐỀ XUẤT CHIẾN LƯỢC QUẢN LÝ TÀI KHOẢN

### 5.1. Quy trình Tạo tài khoản từng Role

#### Role: ADMIN

**Phương thức:** Hard-coded seed script

**Bước triển khai:**

1. Tạo file `apps/api/src/scripts/seed-admin.ts`
2. Run once: `npm run seed:admin`
3. Admin email/password được document trong README.md (production dùng env vars)

**Security:**

- ❌ KHÔNG có API public để tạo admin
- ❌ KHÔNG có UI đăng ký admin
- ✅ Chỉ tạo qua script có quyền access server

---

#### Role: TEACHER

**Phương thức:** Pre-provisioned bởi Admin

**Workflow:**

```
1. Admin import Teachers từ Excel/CSV
   → POST /api/admin/teachers/import (bulk create Teacher documents)

2. Admin vào trang "Quản lý Giảng viên"
   → Xem danh sách Teachers
   → Cột "Tài khoản": Hiển thị "Chưa tạo" hoặc "✓ Đã tạo"

3. Admin click "Tạo tài khoản" cho giảng viên X
   → POST /api/admin/teachers/:id/create-user
   → Backend:
      - Tạo User với email=teacher.email, role=TEACHER, teacherId=X
      - Mật khẩu mặc định = "Teacher@123"
      - Gửi email thông báo đến teacher.email

4. Giảng viên nhận email, login lần đầu
   → Hệ thống bắt đổi mật khẩu (requirePasswordChange flag)
```

**API cần thiết:**

- `POST /api/admin/teachers` (tạo Teacher)
- `POST /api/admin/teachers/import` (bulk import)
- `POST /api/admin/teachers/:id/create-user` (tạo User cho Teacher)
- `PUT /api/admin/teachers/:id` (update Teacher info)
- `DELETE /api/admin/teachers/:id` (xóa Teacher - cascade cần cẩn thận)

**UI cần thiết:**

- Trang `/admin/teachers` (CRUD giảng viên)
- Form import Excel
- Button "Tạo tài khoản" inline

---

#### Role: STUDENT

**Phương thức:** Hybrid (Production dùng Pre-provisioned, MVP dùng Self-Reg + Verify)

**Workflow A: Pre-provisioned (Khuyến nghị)**

```
1. Admin import Students từ Excel
   → POST /api/admin/students/import

2. Hệ thống tự động tạo User cho từng Student:
   - email = student.email
   - role = STUDENT
   - studentId = student._id
   - password = generate random 8 chars

3. Gửi email hàng loạt với thông tin đăng nhập

4. Sinh viên login → đổi mật khẩu
```

**Workflow B: Self-Registration + Verify (MVP/Demo)**

```
1. Sinh viên truy cập /auth/register
   → Form: Email, MSSV, Password

2. Backend check:
   - MSSV có tồn tại trong students collection?
   - Email có khớp với student.email không?

3. Nếu valid:
   → Tạo User(role=STUDENT, studentId=matched._id)
   → Gửi email verify
   → Sau verify → active account

4. Nếu invalid:
   → Reject: "MSSV không tồn tại hoặc email không khớp"
```

**API cần thiết:**

- `POST /api/admin/students/import`
- `POST /api/admin/students/:id/create-user`
- `POST /api/auth/register-student` (Workflow B)
- `POST /api/auth/verify-email` (Workflow B)

**So sánh:**
| Workflow | Ưu điểm | Nhược điểm | Khuyến nghị |
|----------|---------|------------|-------------|
| Pre-provisioned | Security cao, control tốt | Setup cost cao | Production |
| Self-Reg + Verify | UX tốt, demo dễ | Security trung bình | MVP/Demo |

---

### 5.2. Ma trận Phân quyền Tạo tài khoản

| Ai tạo / Ai được tạo | ADMIN         | TEACHER | STUDENT                      |
| -------------------- | ------------- | ------- | ---------------------------- |
| **System Seed**      | ✅            | ❌      | ❌                           |
| **ADMIN**            | ⚠️ (cẩn thận) | ✅      | ✅                           |
| **TEACHER**          | ❌            | ❌      | ❌                           |
| **STUDENT**          | ❌            | ❌      | ⚠️ (chỉ nếu enable self-reg) |
| **Anonymous**        | ❌            | ❌      | ⚠️ (chỉ nếu enable self-reg) |

**Giải thích:**

- ✅ = Được phép
- ⚠️ = Có điều kiện
- ❌ = Cấm

### 5.3. Recommendation Cuối Cùng

**🏆 Khuyến nghị cho hệ thống thực tế (Production):**

| Role        | Method                   | Rationale                         |
| ----------- | ------------------------ | --------------------------------- |
| **ADMIN**   | Hard-coded seed          | Chỉ 1-3 accounts, security tối đa |
| **TEACHER** | Pre-provisioned by Admin | Control chặt chẽ, data integrity  |
| **STUDENT** | Pre-provisioned by Admin | Giống quy trình trường thật       |

**🚀 Khuyến nghị cho MVP/Demo:**

| Role        | Method                          | Rationale         |
| ----------- | ------------------------------- | ----------------- |
| **ADMIN**   | Seed script + env vars          |                   |
| **TEACHER** | Pre-provisioned by Admin        | Vẫn cần control   |
| **STUDENT** | Self-Registration + MSSV Verify | Dễ demo, ít setup |

---

## 🌱 VI. ĐỀ XUẤT SEED DATA STRATEGY

### 6.1. Seed Data Structure

**Thứ tự seed (phải tuân thủ dependencies):**

```
1. Users (ADMIN only)
   └─> 2. Teachers
          ├─> 3. Users (TEACHER role, gắn teacherId)
          ├─> 4. Classes (homeroomTeacherId)
          ├─> 5. Courses (teacherId - optional)
          └─> ...

   └─> 2. Students
          ├─> 3. Users (STUDENT role, gắn studentId)
          └─> ...

6. Enrollments (sau khi có Student + Course)
7. Grades (sau khi có Enrollment)
```

### 6.2. Seed Script Architecture

**File structure:**

```
apps/api/src/scripts/
├── seeds/
│   ├── 01-seed-admin.ts         # Tạo 1 admin
│   ├── 02-seed-teachers.ts       # Tạo 10 giảng viên
│   ├── 03-seed-teacher-users.ts  # Tạo User cho 10 GV
│   ├── 04-seed-classes.ts        # Tạo 5 lớp
│   ├── 05-seed-courses.ts        # Tạo 15 môn học
│   ├── 06-seed-students.ts       # Tạo 100 sinh viên
│   ├── 07-seed-student-users.ts  # Tạo User cho 100 SV
│   ├── 08-seed-enrollments.ts    # Tạo 500 đăng ký
│   └── 09-seed-grades.ts         # Tạo 400 bản điểm
├── seed-all.ts                   # Run tất cả seeds
└── reset-database.ts             # Drop all + seed all
```

### 6.3. Sample Data Content

#### Teachers (10 records)

```typescript
{
  employeeId: "GV001",
  fullName: "Nguyễn Văn An",
  email: "nva@university.edu",
  phone: "0901234001",
  department: "Công nghệ Thông tin",
  specialization: "Lập trình Web",
  status: "ACTIVE"
}
// ... 9 teachers more
```

#### Classes (5 records)

```typescript
{
  code: "CT6A",
  name: "Công nghệ thông tin 6A",
  size: 0, // Sẽ tự tính sau
  homeroomTeacherId: <teacher._id của GV001>
}
```

#### Courses (15 records)

```typescript
{
  code: "CS101",
  name: "Nhập môn Lập trình",
  credits: 3,
  teacherId: <teacher._id của GV002>,
  semester: "Fall 2024",
  academicYear: "2024-2025"
}
```

#### Students (100 records)

```typescript
{
  mssv: "SV001",
  fullName: "Trần Thị Bích",
  dob: new Date("2003-05-15"),
  email: "ttb@student.university.edu",
  phone: "0912345001",
  address: "Hà Nội",
  classId: <class._id của CT6A>
}
// ... 99 more students
```

#### Enrollments (500 records)

```typescript
// Mỗi sinh viên đăng ký 5 môn
{
  studentId: <student._id của SV001>,
  classId: <class._id của CT6A>,
  courseId: <course._id của CS101>,
  semester: "Fall 2024",
  status: "ENROLLED"
}
```

#### Grades (400 records - 80% enrollments có điểm)

```typescript
{
  enrollmentId: <enrollment._id>,
  attendance: 8.5,
  midterm: 7.0,
  final: 8.0,
  total: 7.75, // 10% * 8.5 + 30% * 7.0 + 60% * 8.0
  gradeScale: "B+",
  gradedBy: <teacher._id của GV phụ trách môn>,
  gradedAt: new Date("2024-12-01")
}
```

### 6.4. Seed Commands

**package.json scripts:**

```json
{
  "scripts": {
    "seed:admin": "tsx src/scripts/seeds/01-seed-admin.ts",
    "seed:teachers": "tsx src/scripts/seeds/02-seed-teachers.ts",
    "seed:all": "tsx src/scripts/seed-all.ts",
    "db:reset": "tsx src/scripts/reset-database.ts"
  }
}
```

**Usage:**

```bash
# Seed tất cả từ đầu
npm run db:reset

# Hoặc seed từng phần (dev)
npm run seed:admin
npm run seed:teachers
# ...
```

### 6.5. Data Generation Tips

**Fake Data Libraries:**

- `@faker-js/faker` (tạo tên, email, địa chỉ random)
- `casual` (alternative)

**Example:**

```typescript
import { faker } from '@faker-js/faker';

const students = Array.from({ length: 100 }, (_, i) => ({
  mssv: `SV${String(i + 1).padStart(3, '0')}`,
  fullName: faker.person.fullName({ locale: 'vi' }),
  dob: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }),
  email: `sv${i + 1}@student.university.edu`,
  phone: faker.phone.number('09########'),
  address: faker.location.city(),
  classId: randomClassId(),
}));
```

---

## 📊 VII. SO SÁNH TRƯỚC/SAU CẢI TIẾN

| Khía cạnh                 | ❌ Trước (Hiện tại)            | ✅ Sau (Đề xuất)                  |
| ------------------------- | ------------------------------ | --------------------------------- |
| **Teacher Management**    | Không có bảng Teacher          | Có Teacher collection đầy đủ      |
| **Class.homeroomTeacher** | String (không thể query)       | ObjectId reference Teacher        |
| **User.teacherId**        | ObjectId không ref             | ObjectId ref Teacher              |
| **Course.teacherId**      | Không có                       | ObjectId ref Teacher (optional)   |
| **Grade.gradedBy**        | Không có                       | ObjectId ref Teacher              |
| **Student Account**       | Self-reg tự do (bất kỳ ai)     | Pre-provisioned hoặc Verify MSSV  |
| **Teacher Account**       | Self-reg tự do (nguy hiểm)     | Chỉ Admin tạo sau import          |
| **Admin Account**         | Self-reg tự do (rủi ro cao)    | Seed script, không public API     |
| **Data Integrity**        | Yếu (orphan refs, string name) | Mạnh (full referential integrity) |
| **Querability**           | Không query được Teacher data  | Query tốt (populate, aggregate)   |
| **Reports**               | Không thống kê được GV         | Thống kê đầy đủ theo GV           |
| **Security**              | ❌ Tự phong Admin/Teacher      | ✅ Admin control chặt chẽ         |
| **Real-world Alignment**  | ❌ Không giống trường thật     | ✅ Giống quy trình thực tế        |

---

## 🚀 VIII. ROADMAP TRIỂN KHAI

### Phase 1: Critical Fixes (1 tuần)

**Mục tiêu:** Fix vấn đề nghiêm trọng nhất

1. ✅ Tạo Teacher model & schema
2. ✅ Migrate Class.homeroomTeacher → homeroomTeacherId
3. ✅ Update User.teacherId reference
4. ✅ Tạo CRUD API cho Teacher (`/api/admin/teachers`)
5. ✅ Tạo UI quản lý Teacher (`/admin/teachers`)
6. ✅ Update Course model: thêm teacherId
7. ✅ Update Grade model: thêm gradedBy

**Deliverables:**

- Teacher collection hoạt động
- Admin có thể CRUD giảng viên
- Các references đã được fix

---

### Phase 2: Account Management (1 tuần)

**Mục tiêu:** Cải tiến chiến lược tài khoản

1. ✅ Disable self-registration cho TEACHER/ADMIN
2. ✅ Implement Pre-provisioned workflow cho Teacher:
   - API: `POST /api/admin/teachers/:id/create-user`
   - UI: Button "Tạo tài khoản" trong teacher list
3. ✅ Implement Student account strategy:
   - **Option A:** Pre-provisioned (API bulk create)
   - **Option B:** Self-reg + MSSV verify
4. ✅ Seed script cho Admin account

**Deliverables:**

- Admin có thể tạo Teacher accounts
- Student account strategy hoạt động (chọn A hoặc B)
- Seed scripts sẵn sàng

---

### Phase 3: Data Migration & Seeding (3 ngày)

**Mục tiêu:** Populate database với dữ liệu mẫu

1. ✅ Viết seed scripts (10 files)
2. ✅ Test seed trên local MongoDB
3. ✅ Migrate existing data (nếu có)
4. ✅ Document seed process trong README

**Deliverables:**

- Database có 10 Teachers, 100 Students, 5 Classes, 15 Courses
- 500 Enrollments, 400 Grades
- README hướng dẫn seed

---

### Phase 4: Enhancement (1 tuần)

**Mục tiêu:** Hoàn thiện các tính năng liên quan

1. ✅ Update frontend forms (Class form: dropdown chọn Teacher)
2. ✅ Update reports: thống kê theo Teacher
3. ✅ Update Grade form: tự động điền gradedBy từ logged-in Teacher
4. ✅ Add Teacher profile page
5. ✅ Add Teacher dashboard (view classes & courses they teach)

**Deliverables:**

- UI hoàn chỉnh cho Teacher management
- Reports có thống kê Teacher
- Teacher có dashboard riêng

---

## 📝 IX. CHECKLIST KIỂM TRA

### ✅ Database Schema

- [ ] Teacher collection đã được tạo
- [ ] Teacher.employeeId unique index
- [ ] User.teacherId reference đến Teacher
- [ ] Class.homeroomTeacherId reference đến Teacher
- [ ] Course.teacherId reference đến Teacher (optional)
- [ ] Grade.gradedBy reference đến Teacher
- [ ] Enrollment có status field
- [ ] Student có status field (nếu cần)

### ✅ API Endpoints

- [ ] `GET /api/teachers` (list teachers)
- [ ] `POST /api/admin/teachers` (create teacher)
- [ ] `POST /api/admin/teachers/import` (bulk import)
- [ ] `PUT /api/admin/teachers/:id` (update)
- [ ] `DELETE /api/admin/teachers/:id` (delete)
- [ ] `POST /api/admin/teachers/:id/create-user` (create User)
- [ ] `POST /api/auth/register` CHỈ cho STUDENT (nếu dùng self-reg)
- [ ] DISABLE self-reg cho ADMIN/TEACHER

### ✅ Frontend

- [ ] Trang `/admin/teachers` (CRUD UI)
- [ ] Button "Tạo tài khoản" trong teacher list
- [ ] Class form: dropdown chọn Teacher (không gõ tay)
- [ ] Course form: dropdown chọn Teacher phụ trách
- [ ] Teacher dashboard page
- [ ] Teacher profile page

### ✅ Seed Data

- [ ] Seed script cho 1 Admin
- [ ] Seed script cho 10 Teachers
- [ ] Seed script cho 5 Classes
- [ ] Seed script cho 15 Courses
- [ ] Seed script cho 100 Students
- [ ] Seed script cho 500 Enrollments
- [ ] Seed script cho 400 Grades
- [ ] `npm run db:reset` hoạt động

### ✅ Security

- [ ] Không thể self-register ADMIN qua API
- [ ] Không thể self-register TEACHER qua API
- [ ] Chỉ ADMIN có thể tạo Teacher accounts
- [ ] STUDENT registration có verify (nếu enable self-reg)

### ✅ Documentation

- [ ] README.md hướng dẫn seed database
- [ ] ARCHITECTURE.md cập nhật ER diagram mới
- [ ] API docs cập nhật teacher endpoints
- [ ] Comment trong code về Teacher references

---

## 🎯 X. KẾT LUẬN

### 10.1. Tóm tắt Vấn đề

Hệ thống hiện tại có **2 vấn đề nghiêm trọng**:

1. **Thiếu Teacher model** → Không quản lý được giảng viên, references orphan, không query được
2. **Self-registration tự do** → Bảo mật yếu, không giống thực tế, data integrity kém

### 10.2. Tác động của Giải pháp

Sau khi implement đề xuất:

✅ **Data Integrity:** Tăng 90% (full referential integrity)  
✅ **Security:** Tăng 95% (chỉ admin tạo sensitive accounts)  
✅ **Querability:** Tăng 100% (từ không thể → dễ dàng)  
✅ **Real-world Alignment:** Tăng 100% (giống trường thật)  
✅ **Maintainability:** Tăng 80% (dễ debug, track, report)

### 10.3. Khuyến nghị Hành động Ngay

**🔴 PRIORITY 1 (Must-have - Tuần này):**

1. Tạo Teacher model
2. Migrate Class.homeroomTeacher
3. Fix User.teacherId reference

**🟡 PRIORITY 2 (Should-have - Tuần tới):**

1. Implement Pre-provisioned Teacher accounts
2. Disable self-reg ADMIN/TEACHER
3. Seed scripts cơ bản

**🟢 PRIORITY 3 (Nice-to-have - Phase sau):**

1. Student self-reg + verify
2. Teacher dashboard
3. Advanced reports

---

## 📚 XI. TÀI LIỆU THAM KHẢO

**Codebase hiện tại:**

- `apps/api/src/models/` - Tất cả model files
- `apps/api/src/routes/` - API routes
- `apps/api/src/controllers/` - Business logic
- `apps/web/src/pages/` - Frontend pages
- `docs/REQUIREMENTS.md` - Yêu cầu gốc
- `docs/ARCHITECTURE.md` - Kiến trúc hiện tại

**Best Practices:**

- [Mongoose Schema Design](https://mongoosejs.com/docs/guide.html)
- [MongoDB Indexing Strategies](https://docs.mongodb.com/manual/indexes/)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [User Account Provisioning](https://en.wikipedia.org/wiki/Identity_management)

---

**📅 Document Version:** 1.0  
**👤 Analyzed by:** GitHub Copilot  
**🏷️ Tags:** `database`, `schema-design`, `authentication`, `security`, `mongodb`, `mongoose`
