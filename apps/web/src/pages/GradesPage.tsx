import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import {
  UpsertGradePayload,
  useGradesQuery,
  useGradeStatisticsQuery,
  useUpsertGrade,
  type GradeListItem,
  computeGradeClassification,
} from '../lib/grades';
import {
  FilterPromptMessage,
  GradeStatisticsSection,
} from '../components/GradeStatistics';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { FilterSection, type FilterField } from '../components/FilterSection';
import { Pager } from '../components/Pager';
import { useForm } from 'react-hook-form';
import { z, type ZodType } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '../lib/authHooks';

type ClassItem = { _id: string; code: string; name: string };
type CourseItem = { _id: string; code: string; name: string; credits: number };

const GRADE_SEARCH_FIELDS: FilterField[] = [
  { value: 'studentName', label: 'Tên sinh viên' },
  { value: 'mssv', label: 'MSSV' },
];

export const GradesPage = () => {
  const user = useUser();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get('page') ?? 1) || 1;
  const initialPageSize = Number(searchParams.get('pageSize') ?? 10) || 10;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const [selectedField, setSelectedField] = useState<string>(
    searchParams.get('selectedField') || 'studentName',
  );
  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get('searchValue') || '',
  );
  const [classId, setClassId] = useState<string>(
    searchParams.get('classId') || '',
  );
  const [courseId, setCourseId] = useState<string>(
    searchParams.get('courseId') || '',
  );
  const [semester, setSemester] = useState<string>(
    searchParams.get('semester') || '',
  );

  // Applied filters - only updated when user clicks "Áp dụng lọc" button
  const [appliedFilters, setAppliedFilters] = useState<{
    classId: string;
    courseId: string;
    semester: string;
  }>({
    classId: searchParams.get('classId') || '',
    courseId: searchParams.get('courseId') || '',
    semester: searchParams.get('semester') || '',
  });

  // Track if filters have been applied at least once
  const [hasAppliedOnce, setHasAppliedOnce] = useState(
    !!(
      searchParams.get('classId') ||
      searchParams.get('courseId') ||
      searchParams.get('semester')
    ),
  );

  const params = useMemo(
    () => ({
      page,
      pageSize,
      classId: appliedFilters.classId || undefined,
      courseId: appliedFilters.courseId || undefined,
      semester: appliedFilters.semester || undefined,
      search: searchValue || undefined,
      searchField: selectedField,
    }),
    [page, pageSize, appliedFilters, searchValue, selectedField],
  );

  // Auto-apply filters when classId or courseId changes
  useEffect(() => {
    if (classId || courseId) {
      setAppliedFilters({
        classId,
        courseId,
        semester,
      });
      setHasAppliedOnce(true);
    }
  }, [classId, courseId, semester]);

  // Check if filters have been applied (even if empty - "Tất cả")
  const hasActiveFilters = hasAppliedOnce;

  useEffect(() => {
    const s = new URLSearchParams();
    s.set('page', String(page));
    s.set('pageSize', String(pageSize));
    s.set('selectedField', selectedField);
    if (searchValue) s.set('searchValue', searchValue);
    if (appliedFilters.classId) s.set('classId', appliedFilters.classId);
    if (appliedFilters.courseId) s.set('courseId', appliedFilters.courseId);
    if (appliedFilters.semester) s.set('semester', appliedFilters.semester);
    setSearchParams(s, { replace: true });
  }, [
    page,
    pageSize,
    selectedField,
    searchValue,
    appliedFilters,
    setSearchParams,
  ]);

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await apiClient.get<ClassItem[]>('/classes');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await apiClient.get<CourseItem[]>('/courses');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Get courses filtered by selected class (from enrollments)
  const { data: classCoursesData } = useQuery({
    queryKey: ['enrollments', 'courses', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data } = await apiClient.get<
        Array<{ courseId: CourseItem; _id: string }>
      >('/enrollments', {
        params: { classId },
      });
      // Get unique courses
      const uniqueCourses = Array.from(
        new Map(data.map((e) => [e.courseId._id, e.courseId])).values(),
      );
      return uniqueCourses;
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });

  // Use filtered courses if class is selected, otherwise all courses
  const availableCourses = classId
    ? (classCoursesData ?? [])
    : (coursesData ?? []);

  // Reset courseId when classId changes
  useEffect(() => {
    if (classId && courseId) {
      // Check if current courseId is still valid for the new class
      const isValidCourse = classCoursesData?.some((c) => c._id === courseId);
      if (!isValidCourse) {
        setCourseId('');
      }
    }
  }, [classId, courseId, classCoursesData]);

  const { data, isLoading } = useGradesQuery(params, {
    enabled: hasActiveFilters,
  });

  const { data: statisticsData, isLoading: isLoadingStats } =
    useGradeStatisticsQuery(
      {
        classId: appliedFilters.classId || undefined,
        courseId: appliedFilters.courseId || undefined,
        semester: appliedFilters.semester || undefined,
        search: searchValue || undefined,
        searchField: selectedField,
      },
      {
        enabled: hasActiveFilters,
      },
    );

  const [showForm, setShowForm] = useState(false);
  const [editGrade, setEditGrade] = useState<GradeListItem | null>(null);

  // Use data directly from server (search is handled server-side)
  const filteredData = useMemo(() => data?.items ?? [], [data?.items]);

  const columns = useMemo<ColumnDef<GradeListItem>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        cell: (info) => (page - 1) * pageSize + info.row.index + 1,
        size: 50,
      },
      {
        id: 'mssv',
        header: 'MSSV',
        cell: (info) => info.row.original.enrollmentId.studentId.mssv,
        size: 90,
      },
      {
        id: 'studentName',
        header: 'Họ tên',
        cell: (info) => info.row.original.enrollmentId.studentId.fullName,
        size: 150,
      },
      {
        id: 'class',
        header: 'Lớp',
        cell: (info) => info.row.original.enrollmentId.classId?.code ?? '-',
        size: 90,
      },
      {
        id: 'course',
        header: 'Môn học',
        cell: (info) => {
          const course = info.row.original.enrollmentId.courseId;
          return (
            <div className="truncate" title={`${course.code} - ${course.name}`}>
              {course.code}
            </div>
          );
        },
        size: 90,
      },
      {
        id: 'semester',
        header: 'Học kỳ',
        cell: (info) => info.row.original.enrollmentId.semester,
        size: 90,
      },
      {
        accessorKey: 'attendance',
        header: 'CC',
        cell: (info) => info.getValue() || 0,
        size: 50,
      },
      {
        accessorKey: 'midterm',
        header: 'GK',
        cell: (info) => info.getValue() || 0,
        size: 50,
      },
      {
        accessorKey: 'final',
        header: 'CK',
        cell: (info) => info.getValue() || 0,
        size: 50,
      },
      {
        accessorKey: 'total',
        header: 'TB',
        cell: (info) => {
          const total = info.getValue() as number;
          const classification = computeGradeClassification(total);
          const colorClass =
            total >= 8
              ? 'text-green-600 dark:text-green-400'
              : total >= 6.5
                ? 'text-blue-600 dark:text-blue-400'
                : total >= 5
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400';
          return (
            <div className="group relative">
              <span className={`font-semibold ${colorClass}`}>{total}</span>
              <div className="invisible group-hover:visible absolute left-0 top-full z-10 mt-1 rounded border-2 border-black bg-white px-2 py-1 text-xs shadow-neo-sm whitespace-nowrap dark:bg-nb-dark-section dark:border-nb-dark-border dark:text-nb-dark-text">
                {classification}
              </div>
            </div>
          );
        },
        size: 60,
      },
      {
        accessorKey: 'gpa4',
        header: 'GPA4',
        cell: (info) => {
          const gpa4 = info.getValue() as number;
          return (
            <span className="font-medium">{gpa4?.toFixed(2) || '0.00'}</span>
          );
        },
        size: 60,
      },
      {
        accessorKey: 'letterGrade',
        header: 'Chữ',
        cell: (info) => {
          const letterGrade = info.getValue() as string;
          return <span className="font-medium">{letterGrade || 'F'}</span>;
        },
        size: 50,
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: (info) =>
          canEdit ? (
            <button
              type="button"
              className="px-3 py-1 text-xs border-2 border-black bg-nb-mint hover:bg-nb-lemon transition-all hover:shadow-neo-sm font-medium nb-table-btn-edit dark:border-nb-dark-border"
              onClick={() => {
                setEditGrade(info.row.original);
                setShowForm(true);
              }}
            >
              Sửa điểm
            </button>
          ) : (
            <span className="text-xs opacity-50">-</span>
          ),
        size: 90,
      },
    ],
    [page, pageSize, canEdit],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="nb-card--flat w-full">
          <h1 className="text-2xl md:text-3xl font-bold">Quản lý điểm</h1>
          <p className="mt-1 text-sm opacity-70">
            Chọn lớp/môn để nhập điểm chuyên cần, giữa kỳ, cuối kỳ và tổng kết.
          </p>
        </div>
      </header>

      <FilterSection
        defaultOpen={true}
        searchFields={GRADE_SEARCH_FIELDS}
        selectedField={selectedField}
        searchValue={searchValue}
        onFieldChange={setSelectedField}
        onSearchChange={setSearchValue}
        onClear={() => {
          setSelectedField('studentName');
          setSearchValue('');
          setClassId('');
          setCourseId('');
          setSemester('');
          setAppliedFilters({ classId: '', courseId: '', semester: '' });
          setHasAppliedOnce(false);
        }}
        additionalFilters={
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                className="nb-input w-full"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">-- Tất cả lớp --</option>
                {(classesData ?? []).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>

              <select
                className="nb-input w-full"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">
                  -- {classId ? 'Tất cả môn của lớp' : 'Tất cả môn học'} --
                </option>
                {availableCourses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                className="nb-input w-full"
                value={(() => {
                  // Extract semester part (HK1, HK2, HK3) from "HK1 (2024-2025)" or "HK1"
                  const match = semester.match(/^(HK\d+)/);
                  return match ? match[1] : '';
                })()}
                onChange={(e) => {
                  const semesterNum = e.target.value;
                  // Extract year part (2024-2025) from "HK1 (2024-2025)" or "2024-2025"
                  const yearMatch = semester.match(/(\d{4}-\d{4})/);
                  const year = yearMatch ? yearMatch[1] : '';
                  if (semesterNum && year) {
                    setSemester(`${semesterNum} (${year})`);
                  } else if (semesterNum) {
                    setSemester(semesterNum);
                  } else if (year) {
                    setSemester(year);
                  } else {
                    setSemester('');
                  }
                }}
              >
                <option value="">-- Học kỳ --</option>
                <option value="HK1">Học kỳ 1</option>
                <option value="HK2">Học kỳ 2</option>
                <option value="HK3">Học kỳ 3 (Hè)</option>
              </select>

              <select
                className="nb-input w-full"
                value={(() => {
                  // Extract year part (2024-2025) from "HK1 (2024-2025)" or "2024-2025"
                  const match = semester.match(/(\d{4}-\d{4})/);
                  return match ? match[1] : '';
                })()}
                onChange={(e) => {
                  const year = e.target.value;
                  // Extract semester part (HK1, HK2, HK3)
                  const semesterMatch = semester.match(/^(HK\d+)/);
                  const semesterNum = semesterMatch ? semesterMatch[1] : '';
                  if (semesterNum && year) {
                    setSemester(`${semesterNum} (${year})`);
                  } else if (year) {
                    setSemester(year);
                  } else if (semesterNum) {
                    setSemester(semesterNum);
                  } else {
                    setSemester('');
                  }
                }}
              >
                <option value="">-- Năm học --</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const startYear = new Date().getFullYear() - 5 + i;
                  const endYear = startYear + 1;
                  const academicYear = `${startYear}-${endYear}`;
                  return (
                    <option key={academicYear} value={academicYear}>
                      {academicYear}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        }
      />

      {!hasActiveFilters ? (
        <FilterPromptMessage />
      ) : (
        <>
          <div className="nb-card">
            {isLoading ? (
              <p className="text-sm opacity-70">Đang tải danh sách điểm…</p>
            ) : data && data.items.length > 0 ? (
              <DataTable
                table={table}
                minWidth="900px"
                isLoading={false}
                emptyMessage="Không có dữ liệu điểm"
                showPagination={true}
                overflowYHidden={true}
                paginationSlot={
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm font-semibold px-3 py-2 bg-nb-lemon border-2 border-black inline-block rounded dark:bg-nb-dark-section dark:border-nb-dark-border dark:text-nb-dark-text">
                      Tổng: <span className="font-bold">{data.total}</span> điểm
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Hiển thị:</span>
                        <select
                          className="nb-input w-20 text-sm py-1"
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                          }}
                        >
                          {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <span className="text-sm opacity-70">/ trang</span>
                      </div>
                      <Pager
                        page={page}
                        pageSize={pageSize}
                        total={data.total}
                        onChangePage={setPage}
                      />
                    </div>
                  </div>
                }
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-lg font-semibold opacity-70">
                  Không có dữ liệu điểm cho bộ lọc hiện tại.
                </p>
              </div>
            )}
          </div>

          <GradeStatisticsSection
            statistics={statisticsData}
            isLoading={isLoadingStats}
            hasSearch={!!searchValue}
          />
        </>
      )}

      {showForm && (
        <GradeFormModal
          initial={editGrade}
          onClose={() => {
            setShowForm(false);
            setEditGrade(null);
          }}
        />
      )}
    </section>
  );
};

const gradeFormSchema: ZodType<UpsertGradePayload> = z.object({
  attendance: z
    .number()
    .min(0, 'Điểm chuyên cần >= 0')
    .max(10, 'Điểm chuyên cần <= 10'),
  midterm: z.number().min(0, 'Điểm giữa kỳ >= 0').max(10, 'Điểm giữa kỳ <= 10'),
  final: z.number().min(0, 'Điểm cuối kỳ >= 0').max(10, 'Điểm cuối kỳ <= 10'),
});

function GradeFormModal({
  initial,
  onClose,
}: {
  initial: GradeListItem | null;
  onClose: () => void;
}) {
  const { mutateAsync: upsertMutate, isPending } = useUpsertGrade();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpsertGradePayload>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: initial
      ? {
          attendance: initial.attendance,
          midterm: initial.midterm,
          final: initial.final,
        }
      : {
          attendance: 0,
          midterm: 0,
          final: 0,
        },
  });

  async function onSubmit(values: UpsertGradePayload) {
    if (!initial) return;
    try {
      await upsertMutate({
        enrollmentId: initial.enrollmentId._id,
        payload: values,
      });
      onClose();
      reset();
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  }

  if (!initial) return null;

  const student = initial.enrollmentId.studentId;
  const course = initial.enrollmentId.courseId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="nb-card w-full max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Nhập điểm</h2>
          <button className="nb-btn nb-btn--ghost" onClick={onClose}>
            Đóng
          </button>
        </div>

        <div className="mb-4 p-3 bg-nb-sky dark:bg-nb-dark-section border-2 border-black dark:border-nb-dark-border rounded-md">
          <p className="text-sm">
            <strong>Sinh viên:</strong> {student.fullName} ({student.mssv})
          </p>
          <p className="text-sm">
            <strong>Môn học:</strong> {course.code} - {course.name}
          </p>
          <p className="text-sm">
            <strong>Học kỳ:</strong> {initial.enrollmentId.semester}
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1">
              Điểm chuyên cần (0-10)
            </label>
            <input
              type="number"
              step="0.01"
              className="nb-input w-full"
              placeholder="0.00"
              {...register('attendance', { valueAsNumber: true })}
            />
            {errors.attendance && (
              <p className="mt-1 text-xs text-red-600">
                {errors.attendance.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Điểm giữa kỳ (0-10)
            </label>
            <input
              type="number"
              step="0.01"
              className="nb-input w-full"
              placeholder="0.00"
              {...register('midterm', { valueAsNumber: true })}
            />
            {errors.midterm && (
              <p className="mt-1 text-xs text-red-600">
                {errors.midterm.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Điểm cuối kỳ (0-10)
            </label>
            <input
              type="number"
              step="0.01"
              className="nb-input w-full"
              placeholder="0.00"
              {...register('final', { valueAsNumber: true })}
            />
            {errors.final && (
              <p className="mt-1 text-xs text-red-600">
                {errors.final.message as string}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="nb-btn nb-btn--primary flex-1"
              disabled={isPending}
            >
              {isPending ? 'Đang lưu...' : 'Lưu điểm'}
            </button>
            <button
              type="button"
              className="nb-btn nb-btn--secondary"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
