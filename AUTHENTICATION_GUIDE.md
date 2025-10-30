# 🔐 Hướng dẫn chi tiết Phân quyền (Authentication & Authorization)

## 📚 Tổng quan hệ thống phân quyền

### **3 Roles trong hệ thống:**

| Role | Quyền hạn |
|------|-----------|
| **ADMIN** | Quản lý toàn bộ hệ thống: thêm/sửa/xóa lớp, môn học, giảng viên, sinh viên |
| **TEACHER** | Quản lý điểm, xem danh sách sinh viên trong lớp mình dạy |
| **STUDENT** | Xem thông tin cá nhân, xem điểm của mình |

---

## 🏗️ Kiến trúc hệ thống

### **Backend (API):**
```
1. User Model → Lưu email, password, role
2. JWT Token → Chứa userId và role
3. Auth Middleware → Verify token
4. Role Middleware → Check quyền truy cập
5. Protected Routes → Chỉ role phù hợp mới truy cập được
```

### **Frontend (React):**
```
1. Auth Service → Login API
2. Auth Context → Lưu user state (token, role, email)
3. Protected Route → Redirect nếu chưa login
4. Role-based UI → Hiển thị menu/chức năng theo role
```

---

## 🔧 Backend Implementation

### **1. User Model** (`apps/api/src/models/user.model.ts`)

```typescript
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "TEACHER", "STUDENT"],
    default: "STUDENT",
  },
  studentId: { type: Schema.Types.ObjectId, ref: "Student" },
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher" },
});
```

**Giải thích:**
- `email`: Unique, dùng để đăng nhập
- `passwordHash`: Mật khẩu đã hash (bảo mật)
- `role`: Vai trò của user
- `studentId`: Link đến Student model (nếu là sinh viên)
- `teacherId`: Link đến Teacher model (nếu là giảng viên)

---

### **2. JWT Token** (`apps/api/src/utils/jwt.ts`)

Token chứa thông tin:
```typescript
{
  sub: userId,      // User ID
  role: "ADMIN",    // Role của user
  iat: timestamp,   // Thời gian tạo
  exp: timestamp    // Thời gian hết hạn
}
```

---

### **3. Auth Middleware** (`apps/api/src/middlewares/auth.ts`)

```typescript
export const requireAuth = () => {
  return (req, res, next) => {
    // 1. Lấy token từ header
    const token = req.headers.authorization?.split(" ")[1];
    
    // 2. Verify token
    const payload = verifyAccessToken(token);
    
    // 3. Gắn user vào request
    req.user = payload;
    
    next();
  };
};
```

---

### **4. Role Middleware** (`apps/api/src/middlewares/checkRole.ts`)

```typescript
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Kiểm tra user có role được phép không
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

// Shortcuts
export const adminOnly = checkRole("ADMIN");
export const adminOrTeacher = checkRole("ADMIN", "TEACHER");
```

---

### **5. Protected Routes** - Ví dụ cho Students API

```typescript
// GET /api/students - Admin và Teacher có thể xem
router.get("/", 
  requireAuth(),               // ✅ Phải đăng nhập
  checkRole("ADMIN", "TEACHER"), // ✅ Chỉ Admin hoặc Teacher
  listStudents
);

// POST /api/students - Chỉ Admin mới tạo được
router.post("/", 
  requireAuth(),
  adminOnly,                   // ✅ Chỉ Admin
  createStudent
);

// DELETE /api/students/:id - Chỉ Admin mới xóa được
router.delete("/:id", 
  requireAuth(),
  adminOnly,
  deleteStudent
);
```

---

## 🎨 Frontend Implementation

### **1. Auth Service** (`apps/web/src/services/auth.service.ts`)

```typescript
export const authService = {
  // Đăng nhập
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    // Response: { accessToken, user: { id, email, role } }
    return response.data;
  },

  // Đăng ký
  register: async (email, password, role) => {
    const response = await api.post("/auth/register", { 
      email, 
      password, 
      role 
    });
    return response.data;
  },

  // Lấy thông tin user hiện tại
  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
```

---

### **2. Auth Context** (`apps/web/src/contexts/AuthContext.tsx`)

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  const isAdmin = user?.role === "ADMIN";
  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAdmin, 
      isTeacher, 
      isStudent 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

### **3. Protected Route** (`apps/web/src/components/ProtectedRoute.tsx`)

```typescript
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Chưa đăng nhập → Redirect về login
  if (!user) {
    return <Navigate to="/auth/sign-in" />;
  }

  // Không có quyền → Hiển thị lỗi
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>403 - Forbidden</div>;
  }

  return children;
}
```

---

### **4. Role-based UI Rendering**

```typescript
function AppLayout() {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();

  return (
    <div>
      {/* Admin menu */}
      {isAdmin && (
        <NavLink to="/admin/users">Quản lý Users</NavLink>
        <NavLink to="/students">Quản lý Sinh viên</NavLink>
        <NavLink to="/classes">Quản lý Lớp</NavLink>
      )}

      {/* Teacher menu */}
      {isTeacher && (
        <NavLink to="/my-classes">Lớp của tôi</NavLink>
        <NavLink to="/grades">Quản lý Điểm</NavLink>
      )}

      {/* Student menu */}
      {isStudent && (
        <NavLink to="/profile">Thông tin cá nhân</NavLink>
        <NavLink to="/my-grades">Điểm của tôi</NavLink>
      )}
    </div>
  );
}
```

---

## 📝 Quy trình đăng nhập

### **1. User nhập email + password**
```
Email: admin@example.com
Password: admin123
```

### **2. Frontend gọi API login**
```javascript
const { accessToken, user } = await authService.login(email, password);
// Response: 
// {
//   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
//   user: {
//     id: "123",
//     email: "admin@example.com",
//     role: "ADMIN"
//   }
// }
```

### **3. Lưu token vào localStorage**
```javascript
localStorage.setItem("accessToken", accessToken);
```

### **4. Lưu user vào Auth Context**
```javascript
setUser(user);
```

### **5. Redirect theo role**
```javascript
if (user.role === "ADMIN") {
  navigate("/admin/dashboard");
} else if (user.role === "TEACHER") {
  navigate("/teacher/classes");
} else {
  navigate("/student/profile");
}
```

### **6. Các request sau tự động gửi token**
```javascript
// Axios interceptor tự động thêm
config.headers.Authorization = `Bearer ${accessToken}`;
```

---

## 🔐 Ma trận phân quyền chi tiết

### **Students API:**

| Endpoint | Admin | Teacher | Student |
|----------|-------|---------|---------|
| GET /students | ✅ | ✅ | ❌ |
| GET /students/:id | ✅ | ✅ | ⚠️ (Chỉ xem chính mình) |
| POST /students | ✅ | ❌ | ❌ |
| PUT /students/:id | ✅ | ❌ | ⚠️ (Chỉ sửa chính mình) |
| DELETE /students/:id | ✅ | ❌ | ❌ |

### **Classes API:**

| Endpoint | Admin | Teacher | Student |
|----------|-------|---------|---------|
| GET /classes | ✅ | ✅ | ✅ |
| POST /classes | ✅ | ❌ | ❌ |
| PUT /classes/:id | ✅ | ⚠️ (Lớp mình dạy) | ❌ |
| DELETE /classes/:id | ✅ | ❌ | ❌ |

### **Grades API:**

| Endpoint | Admin | Teacher | Student |
|----------|-------|---------|---------|
| GET /grades | ✅ | ✅ (Lớp mình dạy) | ⚠️ (Điểm của mình) |
| POST /grades | ✅ | ✅ (Lớp mình dạy) | ❌ |
| PUT /grades/:id | ✅ | ✅ (Lớp mình dạy) | ❌ |
| DELETE /grades/:id | ✅ | ❌ | ❌ |

---

## 🧪 Test phân quyền

### **1. Tạo user test**

```bash
# Admin
POST http://localhost:4000/api/auth/register
{
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN"
}

# Teacher
POST http://localhost:4000/api/auth/register
{
  "email": "teacher@example.com",
  "password": "teacher123",
  "role": "TEACHER"
}

# Student
POST http://localhost:4000/api/auth/register
{
  "email": "student@example.com",
  "password": "student123",
  "role": "STUDENT"
}
```

### **2. Test login**

```bash
POST http://localhost:4000/api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### **3. Test protected endpoint**

```bash
# Without token → 401 Unauthorized
GET http://localhost:4000/api/students

# With admin token → 200 OK
GET http://localhost:4000/api/students
Headers: Authorization: Bearer <admin_token>

# With student token → 403 Forbidden
GET http://localhost:4000/api/students
Headers: Authorization: Bearer <student_token>
```

---

## 🎯 Các bước implement đầy đủ

### **Backend:**
1. ✅ User model với role field
2. ✅ Auth middleware (requireAuth)
3. ✅ Role middleware (checkRole)
4. ✅ Auth controller (register, login, getProfile)
5. ⏳ Áp dụng middleware cho tất cả routes
6. ⏳ Seed user mẫu (admin, teacher, student)

### **Frontend:**
1. ⏳ Tạo Auth Service
2. ⏳ Tạo Auth Context
3. ⏳ Tạo Sign In Page
4. ⏳ Tạo Protected Route
5. ⏳ Role-based UI rendering
6. ⏳ Redirect sau login theo role

---

## 🚀 Chạy test

```powershell
# 1. Chạy API
npm run dev --workspace=apps/api

# 2. Test login bằng curl
curl -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\"}'

# 3. Chạy Frontend
npm run dev --workspace=apps/web

# 4. Truy cập http://localhost:5173/auth/sign-in
```

---

**Bạn muốn tôi implement phần nào tiếp theo?**

1. Tạo Auth Context cho Frontend
2. Tạo Sign In Page
3. Tạo Protected Routes
4. Seed user mẫu để test
5. Cập nhật UI theo role

Chọn số thứ tự nhé! 🎯
