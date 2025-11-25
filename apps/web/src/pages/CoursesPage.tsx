import { useMemo, useState } from 'react';
import {
  UpsertCoursePayload,
  useCoursesQuery,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  type CourseListItem,
} from '../lib/courses';
import { useClassesQuery } from '../lib/classes';
import { useEnrollmentsQuery } from '../lib/enrollments';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import { useForm } from 'react-hook-form';
import { DataTable } from '../components/DataTable';
import { FilterSection, type FilterField } from '../components/FilterSection';
import { z, type ZodType } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const COURSE_SEARCH_FIELDS: FilterField[] = [
  { value: 'code', label: 'Mã môn' },
  { value: 'name', label: 'Tên môn' },
];

export const CoursesPage = () => {
  const { data, isLoading } = useCoursesQuery();
  const { data: classesData } = useClassesQuery();
  const { data: enrollmentsData } = useEnrollmentsQuery();

  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseListItem | null>(null);
  const { mutateAsync: deleteMutate } = useDeleteCourse();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter state
  const [selectedField, setSelectedField] = useState<string>('code');
  const [searchValue, setSearchValue] = useState<string>('');
  const [classId, setClassId] = useState<string>('');

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!data) return data;

    let result = data;

    // Filter by classId (via enrollments)
    if (classId && enrollmentsData) {
      const courseIdsInClass = enrollmentsData
        .filter((e) => e.classId?._id === classId)
        .map((e) => e.courseId?._id)
        .filter(Boolean);
      const uniqueCourseIds = [...new Set(courseIdsInClass)];
      result = result.filter((item) => uniqueCourseIds.includes(item._id));
    }

    // Filter by search text
    if (searchValue) {
      result = result.filter((item) => {
        const fieldValue = item[selectedField as keyof CourseListItem];
        if (fieldValue === null || fieldValue === undefined) return false;
        return String(fieldValue)
          .toLowerCase()
          .includes(searchValue.toLowerCase());
      });
    }

    return result;
  }, [data, selectedField, searchValue, classId, enrollmentsData]);

  const columns = useMemo<ColumnDef<CourseListItem>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        cell: (info) => info.row.index + 1,
        size: 50,
      },
      {
        accessorKey: 'code',
        header: 'Mã môn',
        size: 120,
      },
      {
        accessorKey: 'name',
        header: 'Tên môn',
        size: 300,
      },
      {
        accessorKey: 'credits',
        header: 'Số tín chỉ',
        cell: (info) => info.getValue(),
        size: 100,
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex gap-1">
              <button
                type="button"
                className="px-3 py-1 text-xs border-2 border-black bg-nb-mint hover:bg-nb-lemon transition-all hover:shadow-neo-sm font-medium nb-table-btn-edit dark:border-nb-dark-border"
                onClick={() => {
                  setEditCourse(row);
                  setShowForm(true);
                }}
              >
                Sửa
              </button>
              <button
                type="button"
                className="px-3 py-1 text-xs border-2 border-black bg-nb-coral hover:bg-nb-lemon transition-all hover:shadow-neo-sm disabled:opacity-50 font-medium nb-table-btn-delete dark:border-nb-dark-border"
                disabled={deletingId === row._id}
                onClick={async () => {
                  if (!confirm(`Xóa môn học "${row.name}"?`)) return;
                  setDeletingId(row._id);
                  try {
                    await deleteMutate(row._id);
                  } catch {
                    alert('Có lỗi xảy ra khi xóa môn học.');
                  } finally {
                    setDeletingId(null);
                  }
                }}
              >
                {deletingId === row._id ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          );
        },
        size: 120,
      },
    ],
    [deleteMutate, deletingId],
  );

  const table = useReactTable({
    data: filteredData ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="nb-card--flat w-full">
          <h1 className="text-2xl md:text-3xl font-bold">Quản lý môn học</h1>
          <p className="mt-1 text-sm opacity-70">
            CRUD môn học, mã môn và số tín chỉ.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <button
            type="button"
            className="nb-btn nb-btn--primary w-full md:w-auto"
            onClick={() => {
              setEditCourse(null);
              setShowForm(true);
            }}
          >
            Thêm môn học
          </button>
        </div>
      </header>

      {/* Filters */}
      <FilterSection
        searchFields={COURSE_SEARCH_FIELDS}
        selectedField={selectedField}
        searchValue={searchValue}
        onFieldChange={setSelectedField}
        onSearchChange={setSearchValue}
        onClear={() => {
          setSelectedField('code');
          setSearchValue('');
          setClassId('');
        }}
        additionalFilters={
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Lọc theo lớp học
              </label>
              <select
                className="nb-input w-full"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">Tất cả lớp</option>
                {classesData?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />

      <div className="nb-card">
        {isLoading ? (
          <p className="text-sm opacity-70">Đang tải danh sách môn học…</p>
        ) : filteredData && filteredData.length > 0 ? (
          <>
            <DataTable
              table={table}
              minWidth="700px"
              isLoading={false}
              emptyMessage="Không có môn học nào"
              showPagination={false}
            />
            <div className="mt-6 pt-4 border-t-3 border-black dark:border-nb-dark-border">
              <div className="text-sm font-semibold px-3 py-2 bg-nb-lemon border-2 border-black inline-block rounded dark:bg-nb-dark-section dark:border-nb-dark-border dark:text-nb-dark-text">
                {searchValue || classId ? (
                  <>
                    Tìm thấy:{' '}
                    <span className="font-bold">{filteredData.length}</span> /{' '}
                    {data?.length} môn học
                  </>
                ) : (
                  <>
                    Tổng: <span className="font-bold">{data?.length}</span> môn
                    học
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-semibold opacity-70">
              {searchValue || classId
                ? 'Không tìm thấy môn học nào'
                : 'Không có môn học nào'}
            </p>
            <p className="text-sm opacity-50 mt-2">
              {searchValue || classId
                ? 'Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc'
                : 'Thêm môn học mới để bắt đầu'}
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <CourseFormModal
          mode={editCourse ? 'edit' : 'create'}
          initial={editCourse}
          onClose={() => setShowForm(false)}
        />
      )}
    </section>
  );
};

const courseFormSchema: ZodType<UpsertCoursePayload> = z.object({
  code: z.string().min(1, 'Mã môn không được để trống'),
  name: z.string().min(1, 'Tên môn không được để trống'),
  credits: z.number().int().nonnegative({ message: 'Số tín chỉ phải >= 0' }),
});

function CourseFormModal({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial: CourseListItem | null;
  onClose: () => void;
}) {
  const isEdit = mode === 'edit';
  const { mutateAsync: createMutate, isPending: isCreating } =
    useCreateCourse();
  const { mutateAsync: updateMutate, isPending: isUpdating } =
    useUpdateCourse();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpsertCoursePayload>({
    resolver: zodResolver(courseFormSchema),
    defaultValues:
      isEdit && initial
        ? {
            code: initial.code,
            name: initial.name,
            credits: initial.credits,
          }
        : {
            code: '',
            name: '',
            credits: 0,
          },
  });

  async function onSubmit(values: UpsertCoursePayload) {
    const payload: UpsertCoursePayload = {
      code: values.code,
      name: values.name,
      credits: values.credits,
    };
    try {
      if (isEdit && initial) {
        await updateMutate({ id: initial._id, payload });
      } else {
        await createMutate(payload);
      }
      onClose();
      reset();
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } }).response?.status;
      if (status === 409) {
        alert('Trùng mã môn học. Vui lòng kiểm tra lại.');
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="nb-card w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEdit ? 'Sửa môn học' : 'Thêm môn học'}
          </h2>
          <button className="nb-btn nb-btn--ghost" onClick={onClose}>
            Đóng
          </button>
        </div>

        <form
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <input
              className="nb-input"
              placeholder="Mã môn"
              {...register('code')}
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">
                {errors.code.message as string}
              </p>
            )}
          </div>
          <div>
            <input
              className="nb-input"
              placeholder="Tên môn"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.name.message as string}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <input
              type="number"
              className="nb-input"
              placeholder="Số tín chỉ"
              {...register('credits', { valueAsNumber: true })}
            />
            {errors.credits && (
              <p className="mt-1 text-xs text-red-600">
                {errors.credits.message as string}
              </p>
            )}
          </div>

          <div className="md:col-span-2 mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="nb-btn nb-btn--ghost"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="nb-btn nb-btn--primary"
              disabled={isCreating || isUpdating}
            >
              {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
