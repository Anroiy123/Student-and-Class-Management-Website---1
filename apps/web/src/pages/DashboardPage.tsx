import { useMemo, useState } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import {
  useDashboardStats,
  useRecentActivities,
  type ActivityItem,
} from '../lib/dashboard';
import { DataTable } from '../components/DataTable';
import { Pager } from '../components/Pager';

// Config cho metric cards
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
