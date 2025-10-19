export const StudentsPage = () => {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Quản lý sinh viên
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Danh sách sinh viên, tìm kiếm, phân trang, thêm/sửa/xóa.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
        >
          Thêm sinh viên
        </button>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          TODO: hiển thị bảng sinh viên (STT, MSSV, Họ tên, Lớp, Email, SĐT)
          với TanStack Table + React Query.
        </p>
      </div>
    </section>
  );
};
