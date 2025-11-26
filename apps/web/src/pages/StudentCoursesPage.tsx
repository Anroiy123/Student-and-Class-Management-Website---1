import { useState, useMemo } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import {
  useMyEnrollments,
  useMySemesters,
  type MyEnrollmentItem,
} from '../lib/me';
import { DataTable } from '../components/DataTable';
import { Pager } from '../components/Pager';

const PAGE_SIZE = 10;

export const StudentCoursesPage = () => {
  const [page, setPage] = useState(1);
  const [semester, setSemester] = useState<string>('');

  const { data: semesters } = useMySemesters();
  const {
    data: enrollmentsData,
    isLoading,
    error,
  } = useMyEnrollments({
    page,
    pageSize: PAGE_SIZE,
    semester: semester || undefined,
  });

  const columns = useMemo<ColumnDef<MyEnrollmentItem>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        cell: (info) => (page - 1) * PAGE_SIZE + info.row.index + 1,
        size: 60,
      },
      { accessorKey: 'courseCode', header: 'Mã môn', size: 100 },
      { accessorKey: 'courseName', header: 'Tên môn học', size: 250 },
      { accessorKey: 'credits', header: 'Số tín chỉ', size: 100 },
      { accessorKey: 'semester', header: 'Học kỳ', size: 150 },
      {
        accessorKey: 'className',
        header: 'Lớp học phần',
        size: 150,
        cell: (info) => {
          const className = info.getValue() as string | null;
          return className || '-';
        },
      },
    ],
    [page]
  );

  const table = useReactTable({
    data: enrollmentsData?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Calculate total credits
  const totalCredits = enrollmentsData?.items.reduce(
    (sum, item) => sum + item.credits,
    0
  ) ?? 0;

  return (
    <section className="space-y-6">
      <header>
        <div className="nb-card--flat">
          <h1 className="text-2xl font-bold">Môn học của tôi</h1>
          <p className="mt-1 text-sm opacity-70">
            Danh sách các môn học bạn đã đăng ký.
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="nb-card bg-nb-mint">
          <h2 className="text-sm font-semibold">Tổng số môn đăng ký</h2>
          <p className="mt-2 text-3xl font-extrabold">
            {enrollmentsData?.total ?? 0}
          </p>
        </div>
        <div className="nb-card bg-nb-sky">
          <h2 className="text-sm font-semibold">Tổng tín chỉ</h2>
          <p className="mt-2 text-3xl font-extrabold">{totalCredits}</p>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="nb-card">
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm font-medium">Học kỳ:</label>
          <select
            className="nb-input"
            value={semester}
            onChange={(e) => {
              setSemester(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            {semesters?.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p className="text-sm text-nb-coral py-4">
            Không thể tải danh sách môn học
          </p>
        ) : (
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyMessage="Chưa đăng ký môn học nào"
            showPagination={(enrollmentsData?.total ?? 0) > PAGE_SIZE}
            paginationSlot={
              <Pager
                page={page}
                pageSize={PAGE_SIZE}
                total={enrollmentsData?.total ?? 0}
                onChangePage={setPage}
              />
            }
          />
        )}
      </div>
    </section>
  );
};
