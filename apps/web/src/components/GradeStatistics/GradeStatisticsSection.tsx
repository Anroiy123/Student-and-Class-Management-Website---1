import type { GradeStatistics } from '../../lib/grades';
import { StatsSummaryCards, StatsSummaryCardsSkeleton } from './StatsSummaryCards';
import { GradeDistributionChart, ChartSkeleton } from './GradeDistributionChart';

interface GradeStatisticsSectionProps {
  statistics: GradeStatistics | undefined;
  isLoading: boolean;
  hasSearch?: boolean; // true when searching for specific student
}

export function GradeStatisticsSection({
  statistics,
  isLoading,
  hasSearch = false,
}: GradeStatisticsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <StatsSummaryCardsSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (!statistics || statistics.totalCount === 0) {
    return (
      <div className="nb-card text-center py-8">
        <p className="text-sm opacity-70">
          Không có dữ liệu thống kê cho bộ lọc hiện tại
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatsSummaryCards statistics={statistics} />
      <GradeDistributionChart statistics={statistics} hasSearch={hasSearch} />
    </div>
  );
}
