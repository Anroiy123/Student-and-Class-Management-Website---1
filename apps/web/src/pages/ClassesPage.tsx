export const ClassesPage = () => {
  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="nb-card--flat w-full">
          <h1 className="text-2xl font-bold">Quản lý lớp học</h1>
          <p className="mt-1 text-sm opacity-70">
            CRUD lớp, sĩ số và gán sinh viên.
          </p>
        </div>
        <div className="shrink-0">
          <button type="button" className="nb-btn nb-btn--primary">
            Thêm lớp học
          </button>
        </div>
      </header>
      <div className="nb-card">
        <p className="text-sm opacity-70">
          TODO: danh sách lớp học, chi tiết và quản lý thành viên.
        </p>
      </div>
    </section>
  );
};
