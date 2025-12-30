import { useMemo, useState } from 'react';
import {
  UpsertClassPayload,
  useClassesQuery,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  type ClassListItem,
} from '../lib/classes';
import { useTeachers } from '../lib/teachers';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import { useForm } from 'react-hook-form';
import { DataTable } from '../components/DataTable';
import { FilterSection, type FilterField } from '../components/FilterSection';
import { ResponsiveModal } from '../components/Modal';
import { z, type ZodType } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '../lib/authHooks';

const CLASS_SEARCH_FIELDS: FilterField[] = [
  { value: 'code', label: 'Mã lớp' },
  { value: 'name', label: 'Tên lớp' },
  { value: 'homeroomTeacher', label: 'GVCN' },
];

export const ClassesPage = () => {
  const user = useUser();
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading } = useClassesQuery();

  const [showForm, setShowForm] = useState(false);
  const [editClass, setEditClass] = useState<ClassListItem | null>(null);
  const { mutateAsync: deleteMutate } = useDeleteClass();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter state
  const [selectedField, setSelectedField] = useState<string>('code');
  const [searchValue, setSearchValue] = useState<string>('');

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!data || !searchValue) return data;

    return data.filter((item) => {
      let fieldValue: any;
      
      // Special handling for teacher search
      if (selectedField === 'homeroomTeacher') {
        fieldValue = item.homeroomTeacherId?.fullName || '';
      } else {
        fieldValue = item[selectedField as keyof ClassListItem];
      }
      
      if (fieldValue === null || fieldValue === undefined) return false;
      return String(fieldValue)
        .toLowerCase()
        .includes(searchValue.toLowerCase());
    });
  }, [data, selectedField, searchValue]);

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
        accessorKey: 'homeroomTeacherId',
        header: 'GVCN',
        cell: (info) => {
          const teacher = info.getValue() as ClassListItem['homeroomTeacherId'];
          return teacher?.fullName || '—';
        },
        size: 200,
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: (info) => {
          const row = info.row.original;
          if (!isAdmin) {
            return <span className="text-gray-400">—</span>;
          }
          return (
            <div className="flex gap-1">
              <button
                type="button"
                className="px-3 py-1 text-xs border-2 border-black bg-nb-mint hover:bg-nb-lemon transition-all hover:shadow-neo-sm font-medium nb-table-btn-edit dark:border-nb-dark-border"
                onClick={() => {
                  setEditClass(row);
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
    [deleteMutate, deletingId, isAdmin],
  );

  const table = useReactTable({
    data: filteredData ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="space-y-4 sm:space-y-6 transition-all duration-200 overflow-x-hidden max-w-full">
      <header className="flex flex-col lg:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="nb-card--flat w-full transition-all duration-200">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold transition-all duration-200">Quản lý lớp học</h1>
          <p className="mt-1 text-xs sm:text-sm opacity-70">
            CRUD lớp, sĩ số và gán sinh viên.
          </p>
        </div>
        {isAdmin && (
          <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row lg:flex-col gap-2 transition-all duration-200">
            <button
              type="button"
              className="nb-btn nb-btn--primary w-full sm:min-w-[160px] min-h-[44px] touch-manipulation transition-all duration-200"
              onClick={() => {
                setEditClass(null);
                setShowForm(true);
              }}
            >
              <span className="text-sm sm:text-base">Thêm lớp học</span>
            </button>
          </div>
        )}
      </header>

      {/* Filters */}
      <FilterSection
        searchFields={CLASS_SEARCH_FIELDS}
        selectedField={selectedField}
        searchValue={searchValue}
        onFieldChange={setSelectedField}
        onSearchChange={setSearchValue}
        onClear={() => {
          setSelectedField('code');
          setSearchValue('');
        }}
      />

      <div className="nb-card">
        {isLoading ? (
          <p className="text-sm opacity-70">Đang tải danh sách lớp học…</p>
        ) : filteredData && filteredData.length > 0 ? (
          <>
            <DataTable
              table={table}
              minWidth="800px"
              isLoading={false}
              emptyMessage="Không có lớp học nào"
              showPagination={false}
            />
            <div className="mt-6 pt-4 border-t-3 border-black dark:border-nb-dark-border">
              <div className="text-sm font-semibold px-3 py-2 bg-nb-lemon border-2 border-black inline-block rounded dark:bg-nb-dark-section dark:border-nb-dark-border dark:text-nb-dark-text">
                {searchValue ? (
                  <>
                    Tìm thấy:{' '}
                    <span className="font-bold">{filteredData.length}</span> /{' '}
                    {data?.length} lớp học
                  </>
                ) : (
                  <>
                    Tổng: <span className="font-bold">{data?.length}</span> lớp
                    học
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-semibold opacity-70">
              {searchValue
                ? 'Không tìm thấy lớp học nào'
                : 'Không có lớp học nào'}
            </p>
            <p className="text-sm opacity-50 mt-2">
              {searchValue
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Thêm lớp học mới để bắt đầu'}
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
  homeroomTeacherId: z.string().optional(),
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
  const { data: teachers } = useTeachers();

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
            homeroomTeacherId: initial.homeroomTeacherId?._id ?? '',
          }
        : {
            code: '',
            name: '',
            size: 0,
            homeroomTeacherId: '',
          },
  });

  async function onSubmit(values: UpsertClassPayload) {
    const payload: UpsertClassPayload = {
      code: values.code,
      name: values.name,
      size: values.size,
      homeroomTeacherId: values.homeroomTeacherId || undefined,
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
    <ResponsiveModal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Sửa lớp học' : 'Thêm lớp học'}
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row gap-2 w-full justify-end">
          <button
            type="button"
            className="nb-btn nb-btn--ghost min-h-[44px] w-full sm:w-auto touch-manipulation order-2 sm:order-1"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="class-form"
            className="nb-btn nb-btn--primary min-h-[44px] w-full sm:w-auto touch-manipulation order-1 sm:order-2"
            disabled={isCreating || isUpdating}
          >
            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
          </button>
        </div>
      }
    >
      <form
        id="class-form"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <input
            className="nb-input min-h-[44px] touch-manipulation"
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
            className="nb-input min-h-[44px] touch-manipulation"
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
            className="nb-input min-h-[44px] touch-manipulation"
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
          <select className="nb-input min-h-[44px] touch-manipulation" {...register('homeroomTeacherId')}>
            <option value="">-- Chọn GVCN --</option>
            {teachers?.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.fullName} ({teacher.employeeId})
              </option>
            ))}
          </select>
          {errors.homeroomTeacherId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.homeroomTeacherId.message as string}
            </p>
          )}
        </div>
      </form>
    </ResponsiveModal>
  );
}
