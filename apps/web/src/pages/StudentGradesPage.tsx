import { useState, useMemo } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import {
  useMyGrades,
  useMySemesters,
  exportMyGradesPdf,
  downloadPdf,
  type MyGradeItem,
} from '../lib/me';
import { DataTable } from '../components/DataTable';
import { Pager } from '../components/Pager';

const PAGE_SIZE = 10;

export const StudentGradesPage = () => {
  const [page, setPage] = useState(1);
  const [semester, setSemester] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: semesters } = useMySemesters();
  const {
    data: gradesData,
    isLoading,
    error,
  } = useMyGrades({
    page,
    pageSize: PAGE_SIZE,
    semester: semester || undefined,
  });

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const blob = await exportMyGradesPdf();
      const today = new Date().toISOString().split('T')[0];
      downloadPdf(blob, `bang-diem-${today}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Không thể xuất PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = useMemo<ColumnDef<MyGradeItem>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        cell: (info) => (page - 1) * PAGE_SIZE + info.row.index + 1,
        size: 50,
      },
      { accessorKey: 'courseCode', header: 'Mã môn', size: 90 },
      { accessorKey: 'courseName', header: 'Tên môn học', size: 180 },
      { accessorKey: 'credits', header: 'TC', size: 50 },
      { accessorKey: 'semester', header: 'Học kỳ', size: 110 },
      {
        accessorKey: 'attendance',
        header: 'CC',
        size: 50,
        cell: (info) => info.getValue() ?? '-',
      },
      {
        accessorKey: 'midterm',
        header: 'GK',
        size: 50,
        cell: (info) => info.getValue() ?? '-',
      },
      {
        accessorKey: 'final',
        header: 'CK',
        size: 50,
        cell: (info) => info.getValue() ?? '-',
      },
      {
        accessorKey: 'total',
        header: 'Tổng',
        size: 60,
        cell: (info) => {
          const val = info.getValue() as number | null;
          return val !== null ? val.toFixed(2) : '-';
        },
      },
      {
        accessorKey: 'gpa4',
        header: 'GPA 4.0',
        size: 70,
        cell: (info) => {
          const val = info.getValue() as number | null | undefined;
          return val != null ? val.toFixed(2) : '-';
        },
      },
      {
        accessorKey: 'letterGrade',
        header: 'Điểm chữ',
        size: 70,
        cell: (info) => {
          const grade = info.getValue() as string | undefined;
          return grade || '-';
        },
      },
      {
        accessorKey: 'classification',
        header: 'Xếp loại',
        size: 120,
        cell: (info) => {
          const classification = info.getValue() as string;
          const badgeClass = getClassificationBadge(classification);
          return (
            <span className={`edu-badge ${badgeClass} whitespace-nowrap`}>
              {classification}
            </span>
          );
        },
      },
    ],
    [page],
  );

  const table = useReactTable({
    data: gradesData?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const gpaClassification = gradesData?.gpa
    ? getGpaClassification(gradesData.gpa)
    : null;

  return (
    <section className="space-y-6 overflow-x-hidden max-w-full">
      <header>
        <div className="edu-card--flat">
          <h1 className="text-2xl font-bold">Điểm của tôi</h1>
          <p className="mt-1 text-sm text-edu-ink-light dark:text-edu-dark-text-dim">
            Xem điểm các môn học đã đăng ký.
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="edu-stat-card edu-stat-card--accent">
          <h2 className="text-sm font-semibold">Tổng số môn</h2>
          <p className="mt-2 text-3xl font-extrabold">
            {gradesData?.total ?? 0}
          </p>
        </div>
        <div className="edu-stat-card edu-stat-card--primary">
          <h2 className="text-sm font-semibold">Tổng tín chỉ</h2>
          <p className="mt-2 text-3xl font-extrabold">
            {gradesData?.totalCredits ?? 0}
          </p>
        </div>
        <div className="edu-stat-card edu-stat-card--secondary">
          <h2 className="text-sm font-semibold">Điểm TB tích lũy (Thang 10)</h2>
          <p className="mt-2 text-3xl font-extrabold">
            {gradesData?.gpa !== null ? gradesData?.gpa.toFixed(2) : 'Chưa có'}
          </p>
          {gpaClassification && (
            <p className="mt-1 text-sm font-medium">{gpaClassification}</p>
          )}
        </div>
        <div className="edu-stat-card edu-stat-card--success">
          <h2 className="text-sm font-semibold">GPA (Thang 4.0)</h2>
          <p className="mt-2 text-3xl font-extrabold">
            {gradesData?.gpa4 !== null && gradesData?.gpa4 !== undefined
              ? gradesData?.gpa4.toFixed(2)
              : 'Chưa có'}
          </p>
        </div>
      </div>

      {/* Filter and Export */}
      <div className="edu-card">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
          <div className="flex items-center gap-2">
            <label className="edu-label mb-0">Học kỳ:</label>
            <select
              className="edu-select"
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
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting || !gradesData?.items.length}
            className="edu-btn edu-btn--primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Đang xuất...' : 'Xuất PDF'}
          </button>
        </div>

        {error ? (
          <p className="text-sm text-edu-error py-4">
            Không thể tải dữ liệu điểm
          </p>
        ) : (
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyMessage="Chưa có điểm nào"
            showPagination={(gradesData?.total ?? 0) > PAGE_SIZE}
            paginationSlot={
              <Pager
                page={page}
                pageSize={PAGE_SIZE}
                total={gradesData?.total ?? 0}
                onChangePage={setPage}
              />
            }
          />
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

function getGpaClassification(gpa: number): string {
  if (gpa >= 8) return 'Giỏi';
  if (gpa >= 6.5) return 'Khá';
  if (gpa >= 5) return 'Trung bình';
  return 'Yếu';
}
