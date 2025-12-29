# Hướng dẫn Deploy Full-stack lên Render

## Tổng quan

Deploy cả Frontend và Backend lên **Render** (all-in-one solution).

- **Frontend (React)**: Static Site trên Render
- **Backend (API)**: Web Service trên Render
- **Database**: MongoDB Atlas (free tier)

---

## Phương án 1: Deploy với render.yaml (Recommended)

### Bước 1: Chuẩn bị MongoDB Atlas

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

### Bước 2: Push code lên GitHub

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Bước 3: Deploy từ render.yaml

1. Đăng nhập https://render.com (dùng GitHub)
2. Dashboard → **New** → **Blueprint**
3. Connect repository
4. **Blueprint Name**: Đặt tên cho nhóm services, ví dụ:
   - `student-management-system`
   - `student-class-management`
   - `do-an-web`
   
   (Tên này chỉ để quản lý, không ảnh hưởng đến URL)
   
5. Render sẽ tự detect `render.yaml` và tạo 2 services:
   - `student-management-api` (Backend)
   - `student-management-web` (Frontend)

### Bước 4: Cấu hình Environment Variables

**Cho Backend API:**
- `MONGODB_URI`: Paste connection string từ Atlas
- `JWT_SECRET`: Random string dài (ví dụ: `mySuperSecretKey12345!@#$%`)
- `CLIENT_URL`: Sẽ cập nhật sau khi frontend deploy xong

**Cho Frontend Web:**
- `VITE_API_URL`: Sẽ cập nhật sau khi backend deploy xong

### Bước 5: Kết nối 2 services

1. Đợi Backend deploy xong → Copy URL (dạng `https://student-management-api.onrender.com`)
2. Vào Frontend service → Environment → Thêm:
   ```
   VITE_API_URL=https://student-management-api.onrender.com/api
   ```
3. Quay lại Backend service → Environment → Cập nhật:
   ```
   CLIENT_URL=https://student-management-web.onrender.com
   ```
4. Cả 2 services sẽ tự động redeploy

### Bước 6: Kiểm tra

- Backend: `https://student-management-api.onrender.com/health`
- Frontend: `https://student-management-web.onrender.com`

---

## Phương án 2: Tạo services thủ công

### Backend API

1. New → **Web Service**
2. Connect repository
3. Cấu hình:
   ```
   Name: student-management-api
   Region: Singapore
   Branch: main
   Build Command: cd apps/api && npm install && npm run build
   Start Command: cd apps/api && npm start
   ```
4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<Atlas connection string>
   JWT_SECRET=<random secret>
   CLIENT_URL=<sẽ điền sau>
   ```

### Frontend Static Site

1. New → **Static Site**
2. Connect repository
3. Cấu hình:
   ```
   Name: student-management-web
   Region: Singapore
   Branch: main
   Build Command: cd apps/web && npm install && npm run build
   Publish Directory: apps/web/dist
   ```
4. Environment Variables:
   ```
   VITE_API_URL=<Backend URL>/api
   ```

5. Advanced → Rewrites:
   ```
   Source: /*
   Destination: /index.html
   ```

---

## So sánh: Render vs Vercel+Render

| Tiêu chí | Render Only | Vercel + Render |
|----------|-------------|-----------------|
| **Setup** | Đơn giản hơn, 1 platform | 2 platforms riêng |
| **Performance (Frontend)** | Tốt | Xuất sắc (Vercel CDN) |
| **Auto-deploy** | ✅ Cả 2 | ✅ Cả 2 |
| **Free tier** | 750h/service/tháng | Render 750h, Vercel 100GB |
| **Custom domain** | ✅ Free SSL | ✅ Free SSL |
| **Recommended for** | Small projects, demos | Production apps |

---

## Troubleshooting

### Build failed - "Cannot find module"
```bash
# Đảm bảo dependencies đầy đủ
cd apps/api && npm install
cd apps/web && npm install
git add package-lock.json
git commit -m "Add lock files"
git push
```

### Static site shows blank page
- Kiểm tra Console (F12) → Có lỗi API URL không?
- Kiểm tra `VITE_API_URL` đã đúng chưa
- Đảm bảo có trailing `/api`

### CORS errors
- Cập nhật `CLIENT_URL` trên Backend
- URL phải chính xác, không trailing slash
- Redeploy backend sau khi đổi

### API cold start (15-30s)
- Render free tier sleep sau 15 phút inactive
- Request đầu tiên sẽ chậm (wake up)
- Giải pháp: Upgrade plan hoặc dùng cron job ping mỗi 10 phút

---

## Tips

### Tự động ping để tránh sleep
Dùng service miễn phí như https://cron-job.org:
```
URL: https://student-management-api.onrender.com/health
Interval: Every 10 minutes
```

### View logs real-time
- Dashboard → Service → **Logs** tab
- Hoặc dùng CLI: `render logs -f <service-id>`

### Rollback deployment
- Dashboard → Service → **Events** → Click deployment → **Rollback**

---

## Kết quả cuối cùng

✅ **Frontend**: `https://student-management-web.onrender.com`  
✅ **Backend**: `https://student-management-api.onrender.com`  
✅ **Database**: MongoDB Atlas  
✅ **Auto SSL**: Free HTTPS  
✅ **Auto Deploy**: Push to GitHub → Auto build  

**Total cost**: $0/tháng (Free tier)

---

## Next steps

1. **Seed data**: Import CSV vào MongoDB Atlas
2. **Custom domain**: Settings → Add domain
3. **Monitor**: Setup alerts cho downtime
4. **Backup**: MongoDB Atlas tự động backup

Xem thêm: https://render.com/docs
