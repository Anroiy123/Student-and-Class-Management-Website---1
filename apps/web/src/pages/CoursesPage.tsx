export const CoursesPage = () => {
  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="nb-card--flat w-full">
          <h1 className="text-2xl font-bold">Quản lý môn học</h1>
          <p className="mt-1 text-sm opacity-70">
            CRUD môn học, mã môn và số tín chỉ.
          </p>
        </div>
        <div className="shrink-0">
          <button type="button" className="nb-btn nb-btn--primary">
            Thêm môn học
          </button>
        </div>
      </header>
      <div className="nb-card">
        <p className="text-sm opacity-70">
          TODO: danh sách môn học với phân trang và tìm kiếm nâng cao.
        </p>
      </div>
    </section>
  );
};
