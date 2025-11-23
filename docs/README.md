# Website Quản lý Sinh viên và Lớp học

Tài liệu này hướng dẫn cài đặt và vận hành dự án React + Express + MongoDB trong kho mã.

## Tổng quan

- Frontend: React 18, Vite, React Router, TanStack Query/Table, Tailwind CSS.
- Backend: Node.js + Express, Mongoose, Zod, JWT.
- Monorepo: TurboRepo quản lý hai ứng dụng `apps/web` và `apps/api`.

## Cấu trúc thư mục

```

├── apps/
│   ├── api/      # Mã nguồn Express (REST API, MongoDB)
│   └── web/      # Ứng dụng React SPA
|
├── package.json  # Định nghĩa scripts & workspaces
├── turbo.json    # Cấu hình TurboRepo
└── tsconfig.base.json
```

Chi tiết yêu cầu chức năng gốc: xem `REQUIREMENTS.md`.

## Điều kiện tiên quyết

- Node.js ≥ 22.12 **hoặc** ≥ 20.19 (Vite yêu cầu phiên bản này trở lên).
- npm 10+ (đi kèm Node mới).
- Tài khoản MongoDB Atlas (cluster M0) hoặc chuỗi kết nối MongoDB khác.
- Git (khi clone từ GitHub).

## Cài đặt

1. Clone mã nguồn:
   ```bash
   git clone <url>
   cd Student-and-Class-Management-Website---1
   ```
2. Cài dependencies:
   ```bash
   npm install
   ```
3. Tạo file môi trường cho API:
   ```bash
   copy apps\api\.env.example apps\api\.env
   ```
4. Mở `apps/api/.env` và cập nhật:
   - `MONGODB_URI=` chuỗi kết nối Atlas hoặc MongoDB nội bộ.
   - `JWT_SECRET=` chuỗi bí mật bất kỳ (giữ an toàn).
   - `CLIENT_URL=http://localhost:5173` (môi trường dev).
   - `PORT=4000` (tùy chỉnh nếu cần).
5. Nếu dùng Atlas, nhớ whitelist IP hiện tại (`Security > Network Access`).

## Chạy môi trường phát triển

Khởi động đồng thời frontend & backend:

```bash
npm run dev
```

Turbo sẽ chạy song song:

- Vite dev server: http://localhost:5173
- API Express: http://localhost:4000 (log hiển thị `Connected to MongoDB`)

Chạy riêng từng ứng dụng:

```bash
npm run dev -- --filter=api   # chỉ API
npm run dev -- --filter=web   # chỉ web
```

## Các script hữu ích

- `npm run lint` - ESLint cho cả hai ứng dụng.
- `npm run build` - build API (tsc) và web (Vite).
- `npm run format` - kiểm tra định dạng bằng Prettier.
- `npm run test` - hiện chưa có test, script đã sẵn sàng.

## Kiểm tra nhanh API

1. POST `http://localhost:4000/api/auth/register`
   ```json
   {
     "email": "admin@example.com",
     "password": "secret123",
     "role": "ADMIN"
   }
   ```
2. POST `http://localhost:4000/api/auth/login` với thông tin trên để lấy `accessToken`.
3. GửI token (header `Authorization: Bearer <token>`) để gọi các endpoint khác, ví dụ POST `/api/classes`.

## Ghi chú & lỗi thường gặp

- **Cảnh báo duplicate index**: chỉ giữ một cách khai báo index (trên field hoặc `schema.index`) để tránh cảnh báo.
- **Lỗi kết nối MongoDB**: kiểm tra IP whitelist, thông tin đăng nhập và encode đúng ký tự đặc biệt trong chuỗi kết nối.
- **Cảnh báo phiên bản Node**: nâng Node lên 22.12 hoặc 20.19 trở lên nếu thấy cảnh báo từ Vite.

## Hợp tác nhóm

- Không commit file `.env`.
- Chia sẻ biến môi trường qua kênh riêng hoặc mời thành viên vào dự án Atlas và phân quyền phù hợp.
- Cần Docker/triển khai cloud: tham khảo `ARCHITECTURE.md` hoặc mở issue mới.

## Tài liệu bổ sung

- `ARCHITECTURE.md` : kiến trúc chi tiết và roadmap.
- `REQUIREMENTS.md` : đề tài và yêu cầu của đồ án.
