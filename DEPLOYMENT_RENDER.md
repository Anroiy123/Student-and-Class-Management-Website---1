# Hướng dẫn Deploy: Backend (Render) + Frontend (Vercel)

## Tổng quan

- **Backend (API)**: Deploy lên Render Web Service
- **Frontend (React)**: Deploy lên Vercel (CDN nhanh, performance tốt)
- **Database**: MongoDB Atlas (free tier)

---

## Bước 1: Chuẩn bị MongoDB Atlas

1. ✅ Đã có cluster: `cluster0.oee9kli.mongodb.net`
2. Tạo Database User:
   - Database Access → Add New Database User
   - Username: Tự chọn (ví dụ: `admin_user`)
   - Password: Tự tạo (lưu lại để dùng sau)
   - Database User Privileges: **Read and write to any database**
3. Network Access → Add IP `0.0.0.0/0` (allow all)
4. Connection String của bạn:
   ```
   mongodb+srv://<db_username>:<db_password>@cluster0.oee9kli.mongodb.net/?appName=Cluster0
   ```
   
   **Ví dụ:** Nếu username là `admin_user` và password là `MyPass123`:
   ```
   mongodb+srv://admin_user:MyPass123@cluster0.oee9kli.mongodb.net/?appName=Cluster0
   ```

---

## Bước 2: Push code lên GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Bước 3: Deploy Backend lên Render

### 3.1 Tạo Web Service từ Blueprint

1. Đăng nhập https://render.com (dùng GitHub)
2. Dashboard → **New** → **Blueprint**
3. Connect repository
4. **Blueprint Name**: `student-management-system` (hoặc tên bạn thích)
5. Render sẽ tự detect `render.yaml` và tạo service:
   - `student-management-api` (Backend)

### 3.2 Cấu hình Environment Variables

Sau khi Blueprint tạo xong, vào service `student-management-api`:

1. **Environment** tab → Thêm giá trị:
   - `MONGODB_URI`: `mongodb+srv://admin_user:MyPass123@cluster0.oee9kli.mongodb.net/?appName=Cluster0`
   - `JWT_SECRET`: Random string (tự sinh hoặc để Render auto-generate)
   - `CLIENT_URL`: Để trống tạm (sẽ điền sau khi Vercel deploy xong)

2. Click **Save Changes** → Service sẽ tự redeploy

### 3.3 Đợi deploy xong

- Xem **Logs** để theo dõi
- Khi thấy "Connected to MongoDB" → Thành công!
- **Copy URL** của service (ví dụ: `https://student-management-api.onrender.com`)

### 3.4 Kiểm tra API

Truy cập: `https://student-management-api.onrender.com/health`

Nếu thấy:
```json
{"status":"ok","timestamp":"..."}
```
→ Backend đã chạy! ✅

---

## Bước 4: Deploy Frontend lên Vercel

### 4.1 Đăng nhập Vercel

1. Truy cập https://vercel.com
2. Sign up / Login với **GitHub account**

### 4.2 Import Project

1. Dashboard → **Add New** → **Project**
2. Import GitHub repository: `Student-and-Class-Management-Website---1`
3. Vercel tự detect `vercel.json` và hiển thị:
   ```
   Framework Preset: Other
   Build Command: cd apps/web && npm run build
   Output Directory: apps/web/dist
   Install Command: npm install
   ```
4. **Không cần sửa gì** (đã config trong vercel.json)

### 4.3 Thêm Environment Variables

Trong **Configure Project** → **Environment Variables**:

```
VITE_API_URL=https://student-management-api.onrender.com/api
```

⚠️ **Chú ý:**
- Thay `student-management-api.onrender.com` bằng URL Render thực tế
- Phải có `/api` ở cuối

### 4.4 Deploy

1. Click **Deploy**
2. Đợi 2-3 phút
3. Vercel sẽ cung cấp URL production (ví dụ: `https://student-management-web.vercel.app`)

---

## Bước 5: Cập nhật CORS

1. Quay lại **Render Dashboard**
2. Vào service `student-management-api`
3. **Environment** → Sửa `CLIENT_URL`:
   ```
   CLIENT_URL=https://student-management-web.vercel.app
   ```
4. Click **Save Changes** → Backend sẽ tự redeploy

---

## Bước 6: Kiểm tra toàn bộ hệ thống

1. Truy cập URL Vercel: `https://student-management-web.vercel.app`
2. Thử đăng ký tài khoản mới
3. Đăng nhập và test các chức năng

**Nếu gặp lỗi:**
- F12 → Console → Xem lỗi chi tiết
- Kiểm tra `VITE_API_URL` trên Vercel
- Kiểm tra `CLIENT_URL` trên Render

---

## Troubleshooting

### CORS errors
- Kiểm tra `CLIENT_URL` không có trailing slash `/`
- URL phải chính xác: `https://your-app.vercel.app`
- Redeploy backend sau khi đổi

### API trả về 503/504
- Render free tier đang wake up (đợi 30-60s)

### Build failed trên Render
- Xem Logs chi tiết
- Kiểm tra `MONGODB_URI` đã đúng chưa
- Kiểm tra dependencies đủ chưa

### Build failed trên Vercel
- Kiểm tra `VITE_API_URL` đã set chưa
- Xem Build Logs để biết lỗi cụ thể

### Frontend blank page
- F12 → Network tab
- Kiểm tra API calls có đúng URL không
- Kiểm tra `VITE_API_URL` có `/api` ở cuối

---

## Các bước nâng cao

### Auto-deploy
- ✅ Push code → GitHub
- ✅ Render tự build backend
- ✅ Vercel tự build frontend

### Custom Domain

**Vercel:**
1. Settings → Domains → Add Domain
2. Cập nhật DNS records theo hướng dẫn

**Render:**
1. Settings → Custom Domain
2. Add CNAME record

### Tránh cold start (Render)

Dùng cron job ping mỗi 10 phút:
- Service: https://cron-job.org (miễn phí)
- URL: `https://student-management-api.onrender.com/health`
- Interval: `*/10 * * * *` (every 10 minutes)

---

## Kết quả cuối cùng

✅ **Frontend**: `https://student-management-web.vercel.app`  
✅ **Backend**: `https://student-management-api.onrender.com`  
✅ **Database**: MongoDB Atlas  
✅ **Auto SSL**: Free HTTPS  
✅ **Auto Deploy**: Push → Auto build  
✅ **Performance**: Excellent (Vercel CDN)

**Total cost**: $0/tháng (Free tier)

---

## So sánh với deploy cả 2 lên Render

| Tiêu chí | Vercel + Render | Render Only |
|----------|-----------------|-------------|
| **Setup** | 2 platforms | 1 platform |
| **Performance (Frontend)** | ⭐ Xuất sắc (CDN toàn cầu) | ✅ Tốt |
| **Free tier** | Render 750h, Vercel 100GB | Render 750h×2 services |
| **Auto-deploy** | ✅ Cả 2 | ✅ Cả 2 |
| **Recommended** | ✅ Production apps | Small demos |

---

## Next steps

1. **Seed data**: Import CSV vào MongoDB Atlas
2. **Monitor**: Setup uptime monitoring
3. **Backup**: MongoDB Atlas auto-backup
4. **Analytics**: Vercel Analytics (free)

---

## Tài liệu tham khảo

- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
