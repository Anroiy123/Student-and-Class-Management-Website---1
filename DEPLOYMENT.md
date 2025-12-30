# Hướng dẫn Deploy lên Vercel (Frontend) + Render (Backend)

## Tổng quan

- **Frontend (React)**: Deploy lên Vercel
- **Backend (API)**: Deploy lên Render
- **Database**: MongoDB Atlas (free tier)

---

## Bước 1: Chuẩn bị MongoDB Atlas

1. Truy cập https://www.mongodb.com/cloud/atlas/register
2. Tạo tài khoản miễn phí
3. Tạo Cluster mới (chọn M0 Free tier)
4. Trong **Database Access**: Tạo database user với username/password
5. Trong **Network Access**: Add IP `0.0.0.0/0` (allow all) cho Render truy cập
6. Lấy **Connection String**:
   - Click **Connect** → **Connect your application**
   - Copy chuỗi kiểu: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Thay `<username>` và `<password>` bằng thông tin thực tế

---

## Bước 2: Deploy Backend lên Render

### 2.1 Tạo tài khoản Render
- Truy cập https://render.com
- Đăng ký với GitHub account

### 2.2 Push code lên GitHub (nếu chưa)
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2.3 Tạo Web Service trên Render

1. Vào Dashboard → **New** → **Web Service**
2. Connect GitHub repository của bạn
3. Cấu hình:

   **Basic Settings:**
   - Name: `student-management-api`
   - Region: `Singapore` (gần VN nhất)
   - Branch: `main`
   - Root Directory: (để trống)
   - Runtime: `Node`
   - Build Command: `cd apps/api && npm install && npm run build`
   - Start Command: `cd apps/api && npm start`

   **Advanced Settings:**
   - Instance Type: `Free`
   - Health Check Path: `/health`

4. **Environment Variables** - Thêm các biến:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<paste connection string từ Atlas>
   JWT_SECRET=<random string dài và phức tạp>
   CLIENT_URL=https://your-app.vercel.app
   ```

5. Click **Create Web Service**
6. Đợi build xong (5-10 phút)
7. **Copy URL** của service (dạng `https://student-management-api.onrender.com`)

### 2.4 Kiểm tra API
- Truy cập: `https://student-management-api.onrender.com/health`
- Nếu thấy `{"status":"ok"}` → Thành công!

---

## Bước 3: Deploy Frontend lên Vercel

### 3.1 Tạo tài khoản Vercel
- Truy cập https://vercel.com
- Đăng ký với GitHub account

### 3.2 Import project

1. Click **Add New** → **Project**
2. Import GitHub repository
3. Vercel tự động detect cấu hình từ `vercel.json`

### 3.3 Cấu hình Environment Variables

Trong **Environment Variables**, thêm:
```
VITE_API_URL=https://student-management-api.onrender.com/api
```

**Lưu ý**: Thay URL bằng URL Render từ bước 2.7

### 3.4 Deploy

1. Click **Deploy**
2. Đợi build xong (2-3 phút)
3. Vercel sẽ cung cấp URL production (dạng `https://your-app.vercel.app`)

### 3.5 Cập nhật CORS trên Backend

1. Quay lại Render Dashboard
2. Vào Web Service `student-management-api`
3. Vào **Environment** → Sửa `CLIENT_URL`:
   ```
   CLIENT_URL=https://your-app.vercel.app
   ```
4. Service sẽ tự động redeploy

---

## Bước 4: Kiểm tra ứng dụng

1. Truy cập URL Vercel của bạn
2. Thử đăng ký/đăng nhập
3. Test các chức năng chính

**Nếu gặp lỗi CORS:**
- Kiểm tra lại `CLIENT_URL` trên Render
- Đảm bảo không có trailing slash `/`

**Nếu API không connect:**
- Kiểm tra `VITE_API_URL` trên Vercel
- Mở Console (F12) xem lỗi chi tiết

---

## Bước 5: Seed dữ liệu (Optional)

Nếu muốn import CSV vào production:

### 5.1 Local → Atlas
```bash
# Sửa MONGODB_URI trong apps/api/.env thành Atlas connection string
npm run seed:csv
```

### 5.2 Hoặc dùng MongoDB Compass
1. Tải MongoDB Compass
2. Connect đến Atlas bằng connection string
3. Import CSV files thủ công

---

## Lưu ý quan trọng

### Free Tier Limitations

**Render Free:**
- Service sleep sau 15 phút không hoạt động
- Request đầu tiên sau khi sleep sẽ mất 30-60s để wake up
- 750 giờ/tháng miễn phí

**Vercel Free:**
- 100GB bandwidth/tháng
- Deployment tự động khi push code

**MongoDB Atlas M0:**
- 512MB storage
- Shared CPU
- Đủ cho demo/project nhỏ

### Custom Domain (Optional)

**Vercel:**
1. Domains → Add Domain
2. Cập nhật DNS records theo hướng dẫn

**Render:**
1. Settings → Custom Domain
2. Add CNAME record

---

## Troubleshooting

### API trả về 503/504
- Render free tier đang wake up, đợi 1 phút

### CORS errors
- Kiểm tra `CLIENT_URL` trên Render
- Kiểm tra không có typo trong URL

### MongoDB connection failed
- Kiểm tra IP whitelist (phải có `0.0.0.0/0`)
- Kiểm tra username/password đúng
- Kiểm tra encode đặc biệt ký tự trong password

### Build failed on Render
- Kiểm tra logs chi tiết
- Đảm bảo `apps/api/package.json` có đủ dependencies
- Kiểm tra TypeScript compile không lỗi

---

## Commands hữu ích

```bash
# Build local để test
npm run build

# Test production build locally
cd apps/api && npm start
cd apps/web && npm run preview

# View logs trên Render
# → Dashboard → Service → Logs tab

# Trigger redeploy
# → Dashboard → Service → Manual Deploy → Deploy Latest Commit
```

---

## Kết quả cuối cùng

Bạn sẽ có:
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ Backend API: `https://student-management-api.onrender.com`
- ✅ Database: MongoDB Atlas
- ✅ Auto-deploy khi push code lên GitHub
- ✅ HTTPS miễn phí

**Demo credentials (sau khi seed):**
```
Email: admin@example.com
Password: admin123
```
