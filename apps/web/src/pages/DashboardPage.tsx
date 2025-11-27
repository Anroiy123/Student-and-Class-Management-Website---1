import { useMemo, useState } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import {
  useDashboardStats,
  useRecentActivities,
  type ActivityItem,
} from '../lib/dashboard';
import { useMyDashboard } from '../lib/me';
import { useAuth } from '../lib/authHooks';
import { DataTable } from '../components/DataTable';
import { Pager } from '../components/Pager';
import { Link } from 'react-router-dom';
import { DashboardChartsSection } from '../components/DashboardCharts';
import { StudentChartsSection } from '../components/DashboardCharts/StudentChartsSection';

// Config cho metric cards (Admin/Teacher)
const METRIC_CONFIG = [
  { key: 'totalStudents', label: 'Sinh viên', bg: 'bg-nb-mint' },
  { key: 'totalClasses', label: 'Lớp học', bg: 'bg-nb-sky' },
  { key: 'totalCourses', label: 'Môn học', bg: 'bg-nb-tangerine' },
] as const;

// Map loại activity sang label tiếng Việt
const ACTIVITY_TYPE_LABELS: Record<ActivityItem['type'], string> = {
  enrollment: 'Đăng ký',
  grade_update: 'Cập nhật điểm',
  new_student: 'Sinh viên mới',
};

const PAGE_SIZE = 10;

export const DashboardPage = () => {
  const { user } = useAuth();

  // Render student dashboard for STUDENT role
  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  // Render admin/teacher dashboard
  return <AdminDashboard />;
};

// ============ Student Dashboard ============
const StudentDashboard = () => {
  const { data: dashboard, isLoading, error } = useMyDashboard();

  if (isLoading) {
    return (
      <section className="space-y-6">
        <header>
          <div className="nb-card--flat">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
        </header>
        <div className="nb-card">
          <p className="text-center py-8">Đang tải thông tin...</p>
        </div>
      </section>
    );
  }

  if (error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    const errorMessage =
      axiosError?.response?.data?.message || 'Không thể tải dữ liệu';
    return (
      <section className="space-y-6">
        <header>
          <div className="nb-card--flat">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
        </header>
        <div className="nb-card bg-nb-coral/20">
          <p className="text-center py-8 text-nb-coral">{errorMessage}</p>
        </div>
      </section>
    );
  }

  const gpaClassification = dashboard?.stats.gpa
    ? getGpaClassification(dashboard.stats.gpa)
    : null;

  return (
    <section className="space-y-6">
      <header>
        <div className="nb-card--flat">
          <h1 className="text-2xl font-bold">
            Xin chào, {dashboard?.profile.fullName}!
          </h1>
          <p className="mt-1 text-sm opacity-70">
            MSSV: {dashboard?.profile.mssv} | Lớp:{' '}
            {dashboard?.profile.className || 'Chưa phân lớp'}
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="nb-card bg-nb-mint">
          <h2 className="text-sm font-semibold">Môn đã đăng ký</h2>
          <p className="mt-2 text-4xl font-extrabold">
            {dashboard?.stats.totalEnrollments ?? 0}
          </p>
        </div>
        <div className="nb-card bg-nb-sky">
          <h2 className="text-sm font-semibold">Tổng tín chỉ</h2>
          <p className="mt-2 text-4xl font-extrabold">
            {dashboard?.stats.totalCredits ?? 0}
          </p>
        </div>
        <div className="nb-card bg-nb-lilac">
          <h2 className="text-sm font-semibold">Điểm TB (GPA)</h2>
          <p className="mt-2 text-4xl font-extrabold">
            {dashboard?.stats.gpa !== null
              ? dashboard?.stats.gpa.toFixed(2)
              : 'Chưa có'}
          </p>
          {gpaClassification && (
            <p className="mt-1 text-sm font-medium">{gpaClassification}</p>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <StudentChartsSection />

      {/* Recent Grades */}
      <div className="nb-card bg-white dark:bg-nb-dark-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Điểm gần đây</h2>
          <Link to="/my-grades" className="nb-btn nb-btn--secondary text-sm">
            Xem tất cả
          </Link>
        </div>

        {dashboard?.recentGrades && dashboard.recentGrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black dark:border-nb-dark-border">
                  <th className="text-left py-2 px-3">Môn học</th>
                  <th className="text-center py-2 px-3">Tín chỉ</th>
                  <th className="text-center py-2 px-3">Điểm</th>
                  <th className="text-center py-2 px-3">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentGrades.map((grade, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="py-2 px-3">
                      <span className="font-medium">{grade.courseCode}</span> -{' '}
                      {grade.courseName}
                    </td>
                    <td className="text-center py-2 px-3">{grade.credits}</td>
                    <td className="text-center py-2 px-3 font-semibold">
                      {grade.total !== null ? grade.total.toFixed(2) : '-'}
                    </td>
                    <td className="text-center py-2 px-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded border-2 border-black dark:border-nb-dark-border ${getClassificationColor(grade.classification)}`}
                      >
                        {grade.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-4 text-sm opacity-70">
            Chưa có điểm nào
          </p>
        )}
      </div>
    </section>
  );
};

function getClassificationColor(classification: string): string {
  switch (classification) {
    case 'Giỏi':
      return 'bg-nb-mint';
    case 'Khá':
      return 'bg-nb-sky';
    case 'Trung bình':
      return 'bg-nb-tangerine';
    case 'Yếu':
      return 'bg-nb-coral';
    default:
      return 'bg-gray-200 dark:bg-gray-700';
  }
}

function getGpaClassification(gpa: number): string {
  if (gpa >= 8) return 'Giỏi';
  if (gpa >= 6.5) return 'Khá';
  if (gpa >= 5) return 'Trung bình';
  return 'Yếu';
}

// ============ Admin/Teacher Dashboard ============
const AdminDashboard = () => {
  const [page, setPage] = useState(1);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    error: activitiesError,
  } = useRecentActivities({
    page,
    pageSize: PAGE_SIZE,
  });

  const columns = useMemo<ColumnDef<ActivityItem>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        cell: (info) => (page - 1) * PAGE_SIZE + info.row.index + 1,
        size: 60,
      },
      {
        accessorKey: 'type',
        header: 'Loại',
        cell: (info) => {
          const type = info.getValue() as ActivityItem['type'];
          return (
            <span className="px-2 py-1 text-xs font-medium rounded border-2 border-black dark:border-nb-dark-border bg-nb-lilac">
              {ACTIVITY_TYPE_LABELS[type]}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'description',
        header: 'Mô tả',
        size: 400,
      },
      {
        accessorKey: 'timestamp',
        header: 'Thời gian',
        cell: (info) => {
          const date = new Date(info.getValue() as string);
          return date.toLocaleString('vi-VN');
        },
        size: 180,
      },
    ],
    [page],
  );

  const table = useReactTable({
    data: activitiesData?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRIC_CONFIG.map(({ key, label, bg }) => (
          <div key={key} className={'nb-card ' + bg}>
            <h2 className="text-sm font-semibold">{label}</h2>
            {statsLoading ? (
              <p className="mt-2 text-sm opacity-70">Đang tải dữ liệu…</p>
            ) : statsError ? (
              <p className="mt-2 text-sm text-nb-coral">
                Không thể tải dữ liệu
              </p>
            ) : (
              <p className="mt-2 text-4xl font-extrabold">
                {stats?.[key] ?? 0}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Dashboard Charts Section - Requirements: 1.1, 2.1, 3.1, 4.1 */}
      <DashboardChartsSection />

      {/* Recent Activities Section */}
      <div className="nb-card bg-white dark:bg-nb-dark-card">
        <h2 className="text-xl font-bold mb-4">Hoạt động gần đây</h2>

        {activitiesError ? (
          <p className="text-sm text-nb-coral">
            Không thể tải hoạt động gần đây
          </p>
        ) : (
          <DataTable
            table={table}
            isLoading={activitiesLoading}
            emptyMessage="Chưa có hoạt động nào"
            showPagination={(activitiesData?.total ?? 0) > PAGE_SIZE}
            paginationSlot={
              <Pager
                page={page}
                pageSize={PAGE_SIZE}
                total={activitiesData?.total ?? 0}
                onChangePage={setPage}
              />
            }
          />
        )}
      </div>
    </section>
  );
};
