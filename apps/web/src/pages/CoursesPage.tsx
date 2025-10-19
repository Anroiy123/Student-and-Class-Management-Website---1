export const CoursesPage = () => {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Quản lý môn học
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            CRUD môn học, mã môn và số tín chỉ.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
        >
          Thêm môn học
        </button>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          TODO: danh sách môn học với phân trang và tìm kiếm nâng cao.
        </p>
      </div>
    </section>
  );
};
