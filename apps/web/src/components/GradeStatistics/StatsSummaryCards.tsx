import type { GradeStatistics } from '../../lib/grades';

interface StatCardProps {
  title: string;
  value: number;
  colorClass: string;
  bgClass: string;
}

function StatCard({ title, value, colorClass, bgClass }: StatCardProps) {
  return (
    <div
      className={`nb-card ${bgClass} flex flex-col items-center justify-center py-4`}
    >
      <span className="text-xs font-medium opacity-70 mb-1">{title}</span>
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}

interface StatsSummaryCardsProps {
  statistics: GradeStatistics;
}

export function StatsSummaryCards({ statistics }: StatsSummaryCardsProps) {
  const { averages } = statistics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="TB Chuyên cần"
        value={averages.attendance}
        colorClass="text-purple-600 dark:text-purple-400"
        bgClass="bg-purple-50 dark:bg-purple-900/20"
      />
      <StatCard
        title="TB Giữa kỳ"
        value={averages.midterm}
        colorClass="text-blue-600 dark:text-blue-400"
        bgClass="bg-blue-50 dark:bg-blue-900/20"
      />
      <StatCard
        title="TB Cuối kỳ"
        value={averages.final}
        colorClass="text-orange-600 dark:text-orange-400"
        bgClass="bg-orange-50 dark:bg-orange-900/20"
      />
      <StatCard
        title="TB Tổng kết"
        value={averages.total}
        colorClass={
          averages.total >= 8
            ? 'text-green-600 dark:text-green-400'
            : averages.total >= 6.5
              ? 'text-blue-600 dark:text-blue-400'
              : averages.total >= 5
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
        }
        bgClass="bg-nb-lemon dark:bg-nb-dark-section"
      />
    </div>
  );
}

export function StatsSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="nb-card h-24 bg-gray-200 dark:bg-nb-dark-section animate-pulse"
        />
      ))}
    </div>
  );
}
