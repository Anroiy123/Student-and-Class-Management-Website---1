# Tính năng Xuất Báo Cáo Điểm

## 📋 Mô tả

Hệ thống hỗ trợ xuất báo cáo điểm ra 2 định dạng:
- **Excel (.xlsx)** - Phù hợp để chỉnh sửa và phân tích dữ liệu
- **PDF (.pdf)** - Phù hợp để in ấn và lưu trữ

## 🎯 Các loại báo cáo

### 1. Báo cáo điểm cá nhân (GPA Report)
- **Vị trí**: Tab "Điểm trung bình học kỳ"
- **Nội dung**:
  - Thông tin sinh viên
  - GPA tổng quát hoặc theo học kỳ
  - Thống kê tín chỉ (tổng, đạt, chưa đạt)
  - Bảng chi tiết điểm từng môn học
  - Trạng thái đạt/không đạt cho mỗi môn

### 2. Bảng điểm lớp/môn học (Class/Course Grades)
- **Vị trí**: Tab "Quản lý điểm" (góc phải header)
- **Nội dung**:
  - Danh sách điểm của tất cả sinh viên
  - Có thể lọc theo lớp và/hoặc môn học
  - Thông tin: MSSV, họ tên, môn học, điểm CC/GK/CK/Tổng

## 📊 Định dạng báo cáo

### Excel Format
```
├── Tiêu đề báo cáo
├── Thông tin sinh viên/lớp/môn
├── Ngày xuất
├── Phần thống kê tổng quan
└── Bảng chi tiết điểm
```

### PDF Format
- Header với logo/tiêu đề
- Thông tin tổng quan trong box nổi bật
- Bảng điểm được format đẹp với:
  - Color coding theo điểm số
  - Căn chỉnh cột tự động
  - Footer với timestamp

## 🎨 Color Coding

Điểm số được tô màu theo thang:
- 🟢 **Xanh lá** (≥8.5): Xuất sắc/Giỏi
- 🔵 **Xanh dương** (7.0-8.4): Khá
- 🟡 **Vàng** (5.5-6.9): Trung bình
- 🟠 **Cam** (4.0-5.4): Yếu
- 🔴 **Đỏ** (<4.0): Kém

## 💡 Cách sử dụng

### Xuất báo cáo cá nhân:
1. Vào tab "Điểm trung bình học kỳ"
2. Chọn sinh viên từ dropdown
3. (Tùy chọn) Chọn học kỳ cụ thể
4. Click nút "Excel" hoặc "PDF" ở góc phải trên

### Xuất bảng điểm lớp/môn:
1. Vào tab "Quản lý điểm"
2. (Tùy chọn) Lọc theo lớp và/hoặc môn học
3. Click nút "Xuất Excel" hoặc "Xuất PDF" ở header

## 📦 Dependencies

- `xlsx` - Tạo file Excel
- `jspdf` - Tạo file PDF
- `jspdf-autotable` - Tạo bảng trong PDF

## 🔧 Technical Details

### File Naming Convention
```typescript
// Báo cáo cá nhân
BaoCaoDiem_{TenSinhVien}_{HocKy}_{Timestamp}.{xlsx|pdf}

// Bảng điểm lớp/môn
BangDiem_{Timestamp}.{xlsx|pdf}
```

### Export Functions
- `exportToExcel(data, studentName)` - Xuất báo cáo cá nhân Excel
- `exportToPDF(data, studentName)` - Xuất báo cáo cá nhân PDF
- `exportGradesListToExcel(grades, title)` - Xuất bảng điểm Excel
- `exportGradesListToPDF(grades, title)` - Xuất bảng điểm PDF

## 📝 Ví dụ

### Báo cáo cá nhân
```
Tên file: BaoCaoDiem_Hoang_Thanh_Hung_HK1-2023_1730369280000.pdf

Nội dung:
- Sinh viên: Hoàng Thanh Hùng
- Học kỳ: HK1-2023
- GPA: 6.85
- Tổng tín chỉ: 15
- Chi tiết 5 môn học
```

### Bảng điểm lớp
```
Tên file: BangDiem_1730369280000.xlsx

Nội dung:
- Lọc: Lớp CNTT-K60 - Môn CS101
- 25 sinh viên
- Điểm CC, GK, CK, Tổng của từng sinh viên
```

## ✅ Features

- ✅ Xuất Excel với formatting
- ✅ Xuất PDF với color coding
- ✅ Lọc theo lớp/môn học
- ✅ Lọc theo học kỳ
- ✅ Tự động tính toán GPA
- ✅ Thống kê tổng quan
- ✅ Responsive design
- ✅ Download trực tiếp về máy

## 🚀 Future Enhancements

- [ ] Xuất nhiều sinh viên cùng lúc
- [ ] Template báo cáo tùy chỉnh
- [ ] Gửi email báo cáo tự động
- [ ] Biểu đồ phân tích điểm
- [ ] So sánh điểm qua các học kỳ
