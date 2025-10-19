export const DashboardPage = () => {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Tổng quan hệ thống
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Hiển thị số lượng sinh viên, lớp học, môn học và thông tin tóm tắt.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Sinh viên", "Lớp học", "Môn học"].map((metric) => (
          <div
            key={metric}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h2 className="text-sm font-medium text-slate-500">{metric}</h2>
            <p className="mt-2 text-3xl font-semibold text-slate-900">0</p>
          </div>
        ))}
      </div>
    </section>
  );
};
