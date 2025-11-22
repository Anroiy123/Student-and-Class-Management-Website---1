import { useMemo, useState } from 'react';
import {
  UpsertCoursePayload,
  useCoursesQuery,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  type CourseListItem,
} from '../lib/courses';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import { useForm } from 'react-hook-form';
import { z, type ZodType } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const CoursesPage = () => {
  const { data, isLoading } = useCoursesQuery();

  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseListItem | null>(null);
  const { mutateAsync: deleteMutate } = useDeleteCourse();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
                className="px-3 py-1 text-xs border-2 border-black bg-nb-mint hover:bg-nb-lemon transition-colors shadow-neo-sm font-medium nb-table-btn-edit"
                onClick={() => {
                  setEditCourse(row);
                  setShowForm(true);
                }}
              >
                Sửa
              </button>
              <button
                type="button"
                className="px-3 py-1 text-xs border-2 border-black bg-nb-coral hover:bg-red-400 transition-colors shadow-neo-sm disabled:opacity-50 font-medium nb-table-btn-delete"
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
    data: data ?? [],
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

      <div className="nb-card">
        {isLoading ? (
          <p className="text-sm opacity-70">Đang tải danh sách môn học…</p>
        ) : data && data.length > 0 ? (
          <>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-[700px]">
                <table className="w-full text-sm">
                  <thead>
                    {table.getHeaderGroups().map((hg) => (
                      <tr key={hg.id} className="border-b-3 border-black">
                        {hg.headers.map((header) => (
                          <th
                            key={header.id}
                            className="text-left px-3 py-3 font-bold bg-nb-lemon"
                            style={{
                              width: header.column.columnDef.size
                                ? `${header.column.columnDef.size}px`
                                : 'auto',
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`border-b-2 border-black hover:bg-nb-sky/30 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-nb-paper'
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-3 py-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t-3 border-black dark:border-[#4a4a4a]">
              <div className="text-sm font-semibold px-3 py-2 bg-nb-lemon border-2 border-black inline-block rounded dark:bg-nb-dark-section dark:border-[#4a4a4a] dark:text-nb-dark-text">
                Tổng: <span className="font-bold">{data.length}</span> môn học
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-semibold opacity-70">
              Không có môn học nào
            </p>
            <p className="text-sm opacity-50 mt-2">
              Thêm môn học mới để bắt đầu
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
