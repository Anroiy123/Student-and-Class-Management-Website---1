/**
 * Dashboard Charts Section Container
 * Composes all chart components with loading, error, and empty states
 * Requirements: 6.1, 6.2, 6.3, 6.4, 7.2
 */
import { useDashboardCharts } from '../../lib/dashboard';
import { useAuth } from '../../lib/authHooks';
import { ChartSkeleton, ChartError, ChartEmpty } from './ChartStates';
import { GradeDistributionPieChart } from './GradeDistributionPieChart';
import { StudentsByClassChart } from './StudentsByClassChart';
import { EnrollmentTrendChart } from './EnrollmentTrendChart';
import { CoursePopularityChart } from './CoursePopularityChart';

type DashboardChartsSectionProps = {
  limit?: number;
};

export function DashboardChartsSection({ limit = 10 }: DashboardChartsSectionProps) {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useDashboardCharts({ limit });

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="font-display font-bold text-xl mb-4">Biểu đồ thống kê</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mb-8">
        <h2 className="font-display font-bold text-xl mb-4">Biểu đồ thống kê</h2>
        <ChartError onRetry={() => refetch()} />
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const hasGradeData = data.gradeDistribution.total > 0;
  const hasStudentData = data.studentsByClass.length > 0;
  const hasEnrollmentData = data.enrollmentTrend.length > 0;
  const hasCourseData = data.coursePopularity.length > 0;

  // Check if all data is empty (for teacher scope) - Requirement 7.2
  const hasNoData = !hasGradeData && !hasStudentData && !hasEnrollmentData && !hasCourseData;

  if (hasNoData) {
    // Display appropriate message based on user role
    const isTeacher = user?.role === 'TEACHER';
    const emptyMessage = isTeacher
      ? 'Bạn chưa được phân công lớp học hoặc môn học nào. Vui lòng liên hệ quản trị viên để được phân công.'
      : 'Không có dữ liệu thống kê trong hệ thống';

    return (
      <section className="mb-8">
        <h2 className="font-display font-bold text-xl mb-4">Biểu đồ thống kê</h2>
        <ChartEmpty message={emptyMessage} />
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="font-display font-bold text-xl mb-4">Biểu đồ thống kê</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Grade Distribution Pie Chart */}
        {hasGradeData ? (
          <GradeDistributionPieChart data={data.gradeDistribution} />
        ) : (
          <ChartEmpty message="Không có dữ liệu điểm số" />
        )}

        {/* Students By Class Bar Chart */}
        {hasStudentData ? (
          <StudentsByClassChart data={data.studentsByClass} />
        ) : (
          <ChartEmpty message="Không có dữ liệu lớp học" />
        )}

        {/* Enrollment Trend Line Chart */}
        {hasEnrollmentData ? (
          <EnrollmentTrendChart data={data.enrollmentTrend} />
        ) : (
          <ChartEmpty message="Không có dữ liệu đăng ký môn học" />
        )}

        {/* Course Popularity Horizontal Bar Chart */}
        {hasCourseData ? (
          <CoursePopularityChart data={data.coursePopularity} />
        ) : (
          <ChartEmpty message="Không có dữ liệu môn học" />
        )}
      </div>
    </section>
  );
}
