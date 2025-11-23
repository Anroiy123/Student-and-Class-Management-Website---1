import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import {
  ListStudentsParams,
  UpsertStudentPayload,
  useCreateStudent,
  useStudentsQuery,
  useUpdateStudent,
  useDeleteStudent,
  type StudentListItem,
} from '../lib/students';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { FilterSection, type FilterField } from '../components/FilterSection';
import { Pager } from '../components/Pager';
import { useForm } from 'react-hook-form';
import { z, type ZodType } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type ClassItem = { _id: string; code: string; name: string };

const STUDENT_SEARCH_FIELDS: FilterField[] = [
  { value: 'mssv', label: 'MSSV' },
  { value: 'fullName', label: 'Họ tên' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Số điện thoại' },
  { value: 'address', label: 'Địa chỉ' },
];

export const StudentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get('page') ?? 1) || 1;
  const initialPageSize = Number(searchParams.get('pageSize') ?? 10) || 10;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter state: selectedField + searchValue + additional filters
  const [selectedField, setSelectedField] = useState<string>(
    searchParams.get('selectedField') || 'mssv',
  );
  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get('searchValue') || '',
  );
  const [classId, setClassId] = useState<string>(
    searchParams.get('classId') || '',
  );
  const [dobFrom, setDobFrom] = useState<string>(
    searchParams.get('dobFrom') || '',
  );
  const [dobTo, setDobTo] = useState<string>(searchParams.get('dobTo') || '');

  // Build filters object from state
  const filters = useMemo<
    Partial<Omit<ListStudentsParams, 'page' | 'pageSize'>>
  >(() => {
    const f: Partial<Omit<ListStudentsParams, 'page' | 'pageSize'>> = {};

    if (searchValue) {
      f[selectedField as keyof typeof f] = searchValue;
    }
    if (classId) {
      f.classId = classId;
    }
    if (dobFrom) {
      f.dobFrom = dobFrom;
    }
    if (dobTo) {
      f.dobTo = dobTo;
    }

    return f;
  }, [selectedField, searchValue, classId, dobFrom, dobTo]);

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [filters]);

  const params = useMemo(
    () => ({ page, pageSize, ...debouncedFilters }),
    [page, pageSize, debouncedFilters],
  );

  // Sync URL search params
  useEffect(() => {
    const s = new URLSearchParams();
    s.set('page', String(page));
    s.set('pageSize', String(pageSize));
    s.set('selectedField', selectedField);
    if (searchValue) s.set('searchValue', searchValue);
    if (classId) s.set('classId', classId);
    if (dobFrom) s.set('dobFrom', dobFrom);
    if (dobTo) s.set('dobTo', dobTo);
    setSearchParams(s, { replace: true });
  }, [
    page,
    pageSize,
    selectedField,
    searchValue,
    classId,
    dobFrom,
    dobTo,
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

  const { data, isLoading } = useStudentsQuery(params);

  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentListItem | null>(null);
  const { mutateAsync: deleteMutate } = useDeleteStudent();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<StudentListItem>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        cell: (info) => (page - 1) * pageSize + info.row.index + 1,
        size: 50,
      },
      {
        accessorKey: 'mssv',
        header: 'MSSV',
        size: 100,
      },
      {
        accessorKey: 'fullName',
        header: 'Họ tên',
        size: 180,
      },
      {
        id: 'class',
        header: 'Lớp',
        cell: (info) => info.row.original.classId?.code ?? '-',
        size: 100,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => {
          const email = info.getValue() as string;
          return (
            <div className="group relative">
              <span className="block max-w-[200px] truncate">{email}</span>
              <div className="invisible group-hover:visible absolute left-0 top-full z-10 mt-1 rounded border-2 border-black bg-white px-2 py-1 text-xs shadow-neo-sm whitespace-nowrap dark:bg-nb-dark-section dark:border-nb-dark-border dark:text-nb-dark-text">
                {email}
              </div>
            </div>
          );
        },
        size: 200,
      },
      {
        id: 'contact',
        header: 'Liên hệ',
        cell: (info) => {
          const { phone, address } = info.row.original;
          return (
            <div className="group relative">
              <button
                type="button"
                className="text-xs text-black px-2 py-1 border-2 border-black rounded-md bg-nb-sky hover:bg-nb-lemon  transition-colors dark:border-nb-dark-border"
              >
                Chi tiết
              </button>
              <div className="invisible group-hover:visible absolute left-0 top-full z-10 mt-1 rounded border-2 border-black bg-white p-3 text-xs shadow-neo-sm min-w-[250px] dark:bg-nb-dark-section dark:border-nb-dark-border dark:text-nb-dark-text">
                <div className="space-y-1">
                  <div>
                    <strong>SĐT:</strong> {phone || '-'}
                  </div>
                  <div>
                    <strong>Địa chỉ:</strong> {address || '-'}
                  </div>
                </div>
              </div>
            </div>
          );
        },
        size: 90,
      },
      {
        id: 'dob',
        header: 'Ngày sinh',
        cell: (info) => {
          const v = info.row.original.dob;
          if (!v) return '-';
          const d = new Date(v);
          return isNaN(d.getTime()) ? v : d.toLocaleDateString('vi-VN');
        },
        size: 100,
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: (info) => (
          <div className="flex gap-1">
            <button
              type="button"
              className="px-3 py-1 text-xs border-2 border-black bg-nb-mint hover:bg-nb-lemon transition-all hover:shadow-neo-sm font-medium nb-table-btn-edit dark:border-nb-dark-border"
              onClick={() => {
                setEditStudent(info.row.original);
                setShowForm(true);
              }}
            >
              Sửa
            </button>
            <button
              type="button"
              className="px-3 py-1 text-xs border-2 border-black bg-nb-coral hover:bg-nb-lemon transition-all hover:shadow-neo-sm disabled:opacity-50 font-medium nb-table-btn-delete dark:border-nb-dark-border"
              disabled={deletingId === info.row.original._id}
              onClick={async () => {
                const id = info.row.original._id as string;
                if (!window.confirm('Bạn có chắc muốn xóa sinh viên này?'))
                  return;
                try {
                  setDeletingId(id);
                  await deleteMutate(id);
                } catch {
                  alert('Xóa thất bại. Vui lòng thử lại.');
                } finally {
                  setDeletingId(null);
                }
              }}
            >
              {deletingId === info.row.original._id ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        ),
        size: 120,
      },
    ],
    [page, pageSize, deleteMutate, deletingId],
  );

  const table = useReactTable({
    data: (data?.items ?? []) as StudentListItem[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="nb-card--flat w-full">
          <h1 className="text-2xl md:text-3xl font-bold">Quản lý sinh viên</h1>
          <p className="mt-1 text-sm opacity-70">
            Danh sách sinh viên, tìm kiếm, phân trang, thêm/sửa/xóa.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <button
            type="button"
            className="nb-btn nb-btn--primary w-full md:w-auto"
            onClick={() => {
              setEditStudent(null);
              setShowForm(true);
            }}
          >
            Thêm sinh viên
          </button>
        </div>
      </header>

      {/* Filters */}
      <FilterSection
        searchFields={STUDENT_SEARCH_FIELDS}
        selectedField={selectedField}
        searchValue={searchValue}
        onFieldChange={setSelectedField}
        onSearchChange={setSearchValue}
        onClear={() => {
          setSelectedField('mssv');
          setSearchValue('');
          setClassId('');
          setDobFrom('');
          setDobTo('');
        }}
        additionalFilters={
          <div className="space-y-3">
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
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <label className="w-24 text-sm opacity-70 shrink-0">
                  Ngày sinh từ
                </label>
                <input
                  type="date"
                  className="nb-input flex-1"
                  value={dobFrom}
                  onChange={(e) => setDobFrom(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-16 text-sm opacity-70 shrink-0">Đến</label>
                <input
                  type="date"
                  className="nb-input flex-1"
                  value={dobTo}
                  onChange={(e) => setDobTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        }
      />

      <div className="nb-card">
        {isLoading ? (
          <p className="text-sm opacity-70">Đang tải danh sách sinh viên…</p>
        ) : data && data.items.length > 0 ? (
          <DataTable
            table={table}
            minWidth="900px"
            isLoading={false}
            emptyMessage="Không có sinh viên nào phù hợp"
            showPagination={true}
            overflowYHidden={true}
            paginationSlot={
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm font-semibold px-3 py-2 bg-nb-lemon border-2 border-black inline-block rounded dark:bg-nb-dark-section dark:border-nb-dark-border dark:text-nb-dark-text">
                  Tổng: <span className="font-bold">{data.total}</span> sinh
                  viên
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
              Không có sinh viên nào phù hợp
            </p>
            <p className="text-sm opacity-50 mt-2">
              Thử điều chỉnh bộ lọc hoặc thêm sinh viên mới
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <StudentFormModal
          mode={editStudent ? 'edit' : 'create'}
          classes={classesData ?? []}
          initial={editStudent}
          onClose={() => setShowForm(false)}
        />
      )}
    </section>
  );
};

const studentFormSchema: ZodType<UpsertStudentPayload> = z.object({
  mssv: z.string().min(1, 'MSSV không được để trống'),
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  dob: z.string().min(1, 'Ngày sinh không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(6, 'Số điện thoại không hợp lệ'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  classId: z.string().optional().or(z.literal('')),
});

function toDateInputValue(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const off = d.getTimezoneOffset();
  const adj = new Date(d.getTime() - off * 60 * 1000);
  return adj.toISOString().slice(0, 10);
}

function StudentFormModal({
  mode,
  initial,
  classes,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial: StudentListItem | null;
  classes: ClassItem[];
  onClose: () => void;
}) {
  const isEdit = mode === 'edit';
  const { mutateAsync: createMutate, isPending: isCreating } =
    useCreateStudent();
  const { mutateAsync: updateMutate, isPending: isUpdating } =
    useUpdateStudent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpsertStudentPayload>({
    resolver: zodResolver(studentFormSchema),
    defaultValues:
      isEdit && initial
        ? {
            mssv: initial.mssv,
            fullName: initial.fullName,
            dob: toDateInputValue(initial.dob),
            email: initial.email,
            phone: initial.phone,
            address: initial.address,
            classId: initial.classId?._id ?? '',
          }
        : {
            mssv: '',
            fullName: '',
            dob: '',
            email: '',
            phone: '',
            address: '',
            classId: '',
          },
  });

  async function onSubmit(values: UpsertStudentPayload) {
    const payload: UpsertStudentPayload = {
      ...values,
      classId: values.classId ? values.classId : undefined,
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
        alert('Trùng MSSV hoặc Email. Vui lòng kiểm tra lại.');
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
            {isEdit ? 'Sửa sinh viên' : 'Thêm sinh viên'}
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
              placeholder="MSSV"
              {...register('mssv')}
            />
            {errors.mssv && (
              <p className="mt-1 text-xs text-red-600">
                {errors.mssv.message as string}
              </p>
            )}
          </div>
          <div>
            <input
              className="nb-input"
              placeholder="Họ tên"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.fullName.message as string}
              </p>
            )}
          </div>
          <div>
            <input
              type="date"
              className="nb-input"
              placeholder="Ngày sinh"
              {...register('dob')}
            />
            {errors.dob && (
              <p className="mt-1 text-xs text-red-600">
                {errors.dob.message as string}
              </p>
            )}
          </div>
          <div>
            <select className="nb-input" {...register('classId')}>
              <option value="">Chưa chọn lớp</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              className="nb-input"
              placeholder="Email"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message as string}
              </p>
            )}
          </div>
          <div>
            <input
              className="nb-input"
              placeholder="Số điện thoại"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">
                {errors.phone.message as string}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <input
              className="nb-input"
              placeholder="Địa chỉ"
              {...register('address')}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">
                {errors.address.message as string}
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
