import { useMyCharts } from '../../lib/me';
import { ChartSkeleton, ChartError } from './ChartStates';
import { StudentGradeDistributionChart } from './StudentGradeDistributionChart';
import { StudentGradeByCourseChart } from './StudentGradeByCourseChart';
import { StudentGPATrendChart } from './StudentGPATrendChart';
import { StudentCreditsBySemesterChart } from './StudentCreditsBySemesterChart';
import { StudentComponentComparisonChart } from './StudentComponentComparisonChart';

type StudentChartsSectionProps = {
  semester?: string;
};

export function StudentChartsSection({ semester }: StudentChartsSectionProps) {
  const { data, isLoading, isError, error, refetch } = useMyCharts({
    semester,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <ChartError
          onRetry={() => refetch()}
          message={
            error instanceof Error
              ? error.message
              : 'Không thể tải dữ liệu biểu đồ'
          }
        />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-2xl">Biểu đồ thống kê</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1: Grade Distribution + Grade by Course */}
        <StudentGradeDistributionChart data={data.gradeDistribution} />
        <StudentGradeByCourseChart data={data.gradeByCourse} />

        {/* Row 2: GPA Trend + Credits by Semester */}
        <StudentGPATrendChart data={data.gpaBySemester} />
        <StudentCreditsBySemesterChart data={data.creditsBySemester} />

        {/* Row 3: Component Comparison (full width) */}
        <div className="md:col-span-2">
          <StudentComponentComparisonChart data={data.componentComparison} />
        </div>
      </div>
    </div>
  );
}
