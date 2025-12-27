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
  { key: 'totalStudents', label: 'Sinh viên', variant: 'primary' },
  { key: 'totalClasses', label: 'Lớp học', variant: 'accent' },
  { key: 'totalCourses', label: 'Môn học', variant: 'secondary' },
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
        <header className="edu-page-header">
          <h1 className="edu-page-title">Dashboard</h1>
        </header>
        <div className="edu-card">
          <div className="flex items-center justify-center py-12">
            <div className="edu-loading">
              <div className="edu-loading-spinner"></div>
              <span>Đang tải thông tin...</span>
            </div>
          </div>
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
        <header className="edu-page-header">
          <h1 className="edu-page-title">Dashboard</h1>
        </header>
        <div className="edu-alert edu-alert--error" role="alert">
          <span className="text-lg">⚠️</span>
          <p className="font-medium">{errorMessage}</p>
        </div>
      </section>
    );
  }

  const gpaClassification = dashboard?.stats.gpa
    ? getGpaClassification(dashboard.stats.gpa)
    : null;

  return (
    <section className="space-y-6" aria-labelledby="dashboard-title">
      <header className="edu-page-header">
        <h1 id="dashboard-title" className="edu-page-title">
          Xin chào, {dashboard?.profile.fullName}!
        </h1>
        <p className="edu-page-subtitle">
          MSSV: {dashboard?.profile.mssv} • Lớp: {dashboard?.profile.className || 'Chưa phân lớp'}
        </p>
      </header>

      {/* Stats Cards */}
      <div 
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="region"
        aria-label="Thống kê tổng quan"
      >
        <article className="edu-stat-card edu-stat-card--primary">
          <h2 className="text-sm font-medium opacity-90">Môn đã đăng ký</h2>
          <p className="mt-2 text-4xl font-bold" aria-label={`${dashboard?.stats.totalEnrollments ?? 0} môn`}>
            {dashboard?.stats.totalEnrollments ?? 0}
          </p>
        </article>
        <article className="edu-stat-card edu-stat-card--accent">
          <h2 className="text-sm font-medium opacity-90">Tổng tín chỉ</h2>
          <p className="mt-2 text-4xl font-bold" aria-label={`${dashboard?.stats.totalCredits ?? 0} tín chỉ`}>
            {dashboard?.stats.totalCredits ?? 0}
          </p>
        </article>
        <article className="edu-stat-card edu-stat-card--secondary">
          <h2 className="text-sm font-medium opacity-90">Điểm TB (GPA)</h2>
          <p className="mt-2 text-4xl font-bold">
            {dashboard?.stats.gpa !== null
              ? dashboard?.stats.gpa.toFixed(2)
              : '—'}
          </p>
          {gpaClassification && (
            <p className="mt-1 text-sm font-medium opacity-90">{gpaClassification}</p>
          )}
        </article>
      </div>

      {/* Charts Section */}
      <StudentChartsSection />

      {/* Recent Grades */}
      <div className="edu-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-edu-ink dark:text-edu-dark-text">Điểm gần đây</h2>
          <Link 
            to="/my-grades" 
            className="edu-btn edu-btn--ghost text-sm"
            aria-label="Xem tất cả điểm số"
          >
            Xem tất cả →
          </Link>
        </div>

        {dashboard?.recentGrades && dashboard.recentGrades.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-edu-border dark:border-edu-dark-border" role="region" aria-label="Bảng điểm gần đây" tabIndex={0}>
            <table className="w-full" aria-label="Điểm gần đây">
              <thead>
                <tr>
                  <th scope="col">Môn học</th>
                  <th scope="col" className="text-center">Tín chỉ</th>
                  <th scope="col" className="text-center">Điểm</th>
                  <th scope="col" className="text-center">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentGrades.map((grade, index) => (
                  <tr
                    key={index}
                    tabIndex={0}
                  >
                    <td>
                      <span className="font-semibold text-edu-ink dark:text-edu-dark-text">{grade.courseCode}</span>
                      <span className="text-edu-ink-light dark:text-edu-dark-text-dim"> — {grade.courseName}</span>
                    </td>
                    <td className="text-center">{grade.credits}</td>
                    <td className="text-center font-semibold">
                      {grade.total !== null ? grade.total.toFixed(2) : '—'}
                    </td>
                    <td className="text-center">
                      <span
                        className={`edu-badge ${getClassificationBadge(grade.classification)}`}
                        role="status"
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
          <p className="text-center py-8 text-edu-ink-light dark:text-edu-dark-text-dim" role="status">
            Chưa có điểm nào
          </p>
        )}
      </div>
    </section>
  );
};

function getClassificationBadge(classification: string): string {
  switch (classification) {
    case 'Giỏi':
      return 'edu-badge--success';
    case 'Khá':
      return 'edu-badge--info';
    case 'Trung bình':
      return 'edu-badge--warning';
    case 'Yếu':
      return 'edu-badge--error';
    default:
      return 'edu-badge--primary';
  }
}

function getClassificationColor(classification: string): string {
  switch (classification) {
    case 'Giỏi':
      return 'bg-edu-success-light text-edu-success';
    case 'Khá':
      return 'bg-edu-info-light text-edu-info';
    case 'Trung bình':
      return 'bg-edu-warning-light text-edu-warning';
    case 'Yếu':
      return 'bg-edu-error-light text-edu-error';
    default:
      return 'bg-edu-muted text-edu-ink-light dark:bg-edu-dark-muted dark:text-edu-dark-text-dim';
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
            <span className="edu-badge edu-badge--primary">
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

  const getVariantClass = (variant: string) => {
    switch (variant) {
      case 'primary': return 'edu-stat-card--primary';
      case 'accent': return 'edu-stat-card--accent';
      case 'secondary': return 'edu-stat-card--secondary';
      default: return 'edu-stat-card--primary';
    }
  };

  return (
    <section className="space-y-6">
      <header className="edu-page-header">
        <h1 className="edu-page-title">Tổng quan hệ thống</h1>
        <p className="edu-page-subtitle">
          Quản lý sinh viên, lớp học, môn học và theo dõi hoạt động.
        </p>
      </header>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRIC_CONFIG.map(({ key, label, variant }) => (
          <article key={key} className={`edu-stat-card ${getVariantClass(variant)}`}>
            <h2 className="text-sm font-medium opacity-90">{label}</h2>
            {statsLoading ? (
              <div className="mt-3 flex items-center gap-2">
                <div className="edu-loading-spinner w-4 h-4 border-white/30 border-t-white"></div>
                <span className="text-sm opacity-70">Đang tải...</span>
              </div>
            ) : statsError ? (
              <p className="mt-2 text-sm opacity-70">Không thể tải</p>
            ) : (
              <p className="mt-2 text-4xl font-bold">
                {stats?.[key] ?? 0}
              </p>
            )}
          </article>
        ))}
      </div>

      {/* Dashboard Charts Section - Requirements: 1.1, 2.1, 3.1, 4.1 */}
      <DashboardChartsSection />

      {/* Recent Activities Section */}
      <div className="edu-card">
        <h2 className="text-lg font-semibold text-edu-ink dark:text-edu-dark-text mb-4">Hoạt động gần đây</h2>

        {activitiesError ? (
          <div className="edu-alert edu-alert--error">
            <span>⚠️</span>
            <p>Không thể tải hoạt động gần đây</p>
          </div>
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
