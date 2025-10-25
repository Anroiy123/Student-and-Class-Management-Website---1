export const StudentsPage = () => {
  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="nb-card--flat w-full">
          <h1 className="text-2xl font-bold">Quản lý sinh viên</h1>
          <p className="mt-1 text-sm opacity-70">
            Danh sách sinh viên, tìm kiếm, phân trang, thêm/sửa/xóa.
          </p>
        </div>
        <div className="shrink-0">
          <button type="button" className="nb-btn nb-btn--primary">
            Thêm sinh viên
          </button>
        </div>
      </header>

      <div className="nb-card">
        <p className="text-sm opacity-70">
          TODO: hiển thị bảng sinh viên (STT, MSSV, Họ tên, Lớp, Email, SĐT) với
          TanStack Table + React Query.
        </p>
      </div>
    </section>
  );
};
