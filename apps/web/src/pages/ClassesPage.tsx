import { useMemo, useState } from 'react';
import {
  UpsertClassPayload,
  useClassesQuery,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  type ClassListItem,
} from '../lib/classes';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import { useForm } from 'react-hook-form';
import { z, type ZodType } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const ClassesPage = () => {
  const { data, isLoading } = useClassesQuery();

  const [showForm, setShowForm] = useState(false);
  const [editClass, setEditClass] = useState<ClassListItem | null>(null);
  const { mutateAsync: deleteMutate } = useDeleteClass();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<ClassListItem>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        cell: (info) => info.row.index + 1,
        size: 50,
      },
      {
        accessorKey: 'code',
        header: 'Mã lớp',
        size: 120,
      },
      {
        accessorKey: 'name',
        header: 'Tên lớp',
        size: 250,
      },
      {
        accessorKey: 'size',
        header: 'Sĩ số',
        cell: (info) => info.getValue() ?? 0,
        size: 80,
      },
      {
        accessorKey: 'homeroomTeacher',
        header: 'GVCN',
        cell: (info) => {
          const teacher = info.getValue() as string | null;
          return teacher || '—';
        },
        size: 200,
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
                  setEditClass(row);
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
                  if (!confirm(`Xóa lớp "${row.name}"?`)) return;
                  setDeletingId(row._id);
                  try {
                    await deleteMutate(row._id);
                  } catch {
                    alert('Có lỗi xảy ra khi xóa lớp.');
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
          <h1 className="text-2xl md:text-3xl font-bold">Quản lý lớp học</h1>
          <p className="mt-1 text-sm opacity-70">
            CRUD lớp, sĩ số và gán sinh viên.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <button
            type="button"
            className="nb-btn nb-btn--primary w-full md:w-auto"
            onClick={() => {
              setEditClass(null);
              setShowForm(true);
            }}
          >
            Thêm lớp học
          </button>
        </div>
      </header>

      <div className="nb-card">
        {isLoading ? (
          <p className="text-sm opacity-70">Đang tải danh sách lớp học…</p>
        ) : data && data.length > 0 ? (
          <>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-[800px]">
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
                Tổng: <span className="font-bold">{data.length}</span> lớp học
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-semibold opacity-70">
              Không có lớp học nào
            </p>
            <p className="text-sm opacity-50 mt-2">
              Thêm lớp học mới để bắt đầu
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <ClassFormModal
          mode={editClass ? 'edit' : 'create'}
          initial={editClass}
          onClose={() => setShowForm(false)}
        />
      )}
    </section>
  );
};

const classFormSchema: ZodType<UpsertClassPayload> = z.object({
  code: z.string().min(1, 'Mã lớp không được để trống'),
  name: z.string().min(1, 'Tên lớp không được để trống'),
  size: z.number().int().nonnegative().optional(),
  homeroomTeacher: z.string().optional(),
});

function ClassFormModal({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial: ClassListItem | null;
  onClose: () => void;
}) {
  const isEdit = mode === 'edit';
  const { mutateAsync: createMutate, isPending: isCreating } = useCreateClass();
  const { mutateAsync: updateMutate, isPending: isUpdating } = useUpdateClass();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpsertClassPayload>({
    resolver: zodResolver(classFormSchema),
    defaultValues:
      isEdit && initial
        ? {
            code: initial.code,
            name: initial.name,
            size: initial.size,
            homeroomTeacher: initial.homeroomTeacher ?? '',
          }
        : {
            code: '',
            name: '',
            size: 0,
            homeroomTeacher: '',
          },
  });

  async function onSubmit(values: UpsertClassPayload) {
    const payload: UpsertClassPayload = {
      code: values.code,
      name: values.name,
      size: values.size,
      homeroomTeacher: values.homeroomTeacher || undefined,
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
        alert('Trùng mã lớp. Vui lòng kiểm tra lại.');
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
            {isEdit ? 'Sửa lớp học' : 'Thêm lớp học'}
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
              placeholder="Mã lớp"
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
              placeholder="Tên lớp"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.name.message as string}
              </p>
            )}
          </div>
          <div>
            <input
              type="number"
              className="nb-input"
              placeholder="Sĩ số"
              {...register('size', { valueAsNumber: true })}
            />
            {errors.size && (
              <p className="mt-1 text-xs text-red-600">
                {errors.size.message as string}
              </p>
            )}
          </div>
          <div>
            <input
              className="nb-input"
              placeholder="Giáo viên chủ nhiệm"
              {...register('homeroomTeacher')}
            />
            {errors.homeroomTeacher && (
              <p className="mt-1 text-xs text-red-600">
                {errors.homeroomTeacher.message as string}
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
