export const DashboardPage = () => {
  return (
    <section className="space-y-6">
      <header>
        <div className="nb-card--flat">
          <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
          <p className="mt-1 text-sm opacity-70">
            Hiển thị số lượng sinh viên, lớp học, môn học và thông tin tóm tắt.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Sinh viên', 'Lớp học', 'Môn học'].map((metric, idx) => {
          const bg = ['bg-nb-mint', 'bg-nb-sky', 'bg-nb-tangerine'][idx % 3];
          return (
            <div key={metric} className={'nb-card ' + bg}>
              <h2 className="text-sm font-semibold">{metric}</h2>
              <p className="mt-2 text-4xl font-extrabold">0</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
