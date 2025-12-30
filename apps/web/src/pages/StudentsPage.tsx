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
import { ResponsiveModal } from '../components/Modal';
import { useForm } from 'react-hook-form';
import { z, type ZodType } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '../lib/authHooks';

type ClassItem = { _id: string; code: string; name: string };

const STUDENT_SEARCH_FIELDS: FilterField[] = [
  { value: 'mssv', label: 'MSSV' },
  { value: 'fullName', label: 'Họ tên' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Số điện thoại' },
  { value: 'address', label: 'Địa chỉ' },
];

export const StudentsPage = () => {
  const user = useUser();
  const isAdmin = user?.role === 'ADMIN';

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
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors?: string[];
  } | null>(null);

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
              <div className="invisible group-hover:visible absolute left-0 top-full z-10 mt-1 rounded-lg border bg-edu-surface px-2 py-1 text-xs shadow-elevated whitespace-nowrap text-edu-ink border-edu-border dark:bg-edu-dark-surface dark:border-edu-dark-border dark:text-edu-dark-text">
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
          const isLastRow = info.row.index === (data?.items.length ?? 0) - 1;
          return (
            <div className="group relative">
              <button
                type="button"
                className="text-xs px-2 py-1 border rounded-md transition-colors bg-edu-primary/10 text-edu-primary border-edu-primary/30 hover:bg-edu-primary hover:text-white dark:bg-edu-dark-primary/20 dark:text-edu-dark-primary dark:border-edu-dark-primary/30 dark:hover:bg-edu-dark-primary dark:hover:text-edu-dark-bg"
              >
                Chi tiết
              </button>
              <div
                className={`invisible group-hover:visible absolute left-0 z-10 rounded-lg border bg-edu-surface p-3 text-xs shadow-elevated min-w-[250px] text-edu-ink border-edu-border dark:bg-edu-dark-surface dark:border-edu-dark-border dark:text-edu-dark-text ${
                  isLastRow ? 'bottom-full mb-1' : 'top-full mt-1'
                }`}
              >
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
        cell: (info) =>
          isAdmin ? (
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
          ) : (
            <span className="text-gray-400">—</span>
          ),
        size: 120,
      },
    ],
    [page, pageSize, deleteMutate, deletingId, isAdmin],
  );

  const table = useReactTable({
    data: (data?.items ?? []) as StudentListItem[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      const response = await fetch(`${API_BASE_URL}/students/template/excel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải file mẫu');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mau-danh-sach-sinh-vien.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert(error.message || 'Không thể tải file mẫu. Vui lòng thử lại.');
    }
  };

  const handleImportExcel = async () => {
    if (!importFile) {
      alert('Vui lòng chọn file Excel');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const token = localStorage.getItem('accessToken');
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      const response = await fetch(`${API_BASE_URL}/students/import/excel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Import thất bại');
      }

      setImportResult(result);

      // Refetch students list
      if (result.imported > 0) {
        window.location.reload();
      }
    } catch (error: any) {
      alert(error.message || 'Import thất bại. Vui lòng thử lại.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="space-y-4 sm:space-y-6 transition-all duration-200 overflow-x-hidden max-w-full">
      <header className="flex flex-col lg:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="nb-card--flat w-full transition-all duration-200">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold transition-all duration-200">Quản lý sinh viên</h1>
          <p className="mt-1 text-xs sm:text-sm opacity-70">
            Danh sách sinh viên, tìm kiếm, phân trang, thêm/sửa/xóa.
          </p>
        </div>
        {isAdmin && (
          <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row lg:flex-col gap-2 transition-all duration-200">
            <button
              type="button"
              className="nb-btn nb-btn--primary w-full sm:min-w-[160px] min-h-[44px] touch-manipulation transition-all duration-200"
              onClick={() => {
                setEditStudent(null);
                setShowForm(true);
              }}
            >
              <span className="text-sm sm:text-base">Thêm sinh viên</span>
            </button>
            <button
              type="button"
              className="nb-btn nb-btn--accent w-full sm:min-w-[160px] min-h-[44px] touch-manipulation transition-all duration-200"
              onClick={() => setShowImportModal(true)}
            >
              <span className="text-sm sm:text-base"> Import Excel</span>
            </button>
          </div>
        )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-xs sm:text-sm opacity-70 sm:w-24 shrink-0">
                  Ngày sinh từ
                </label>
                <input
                  type="date"
                  className="nb-input w-full sm:flex-1 min-h-[44px] touch-manipulation transition-all duration-200"
                  value={dobFrom}
                  onChange={(e) => setDobFrom(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-xs sm:text-sm opacity-70 sm:w-16 shrink-0">Đến</label>
                <input
                  type="date"
                  className="nb-input w-full sm:flex-1 min-h-[44px] touch-manipulation transition-all duration-200"
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

      {/* Import Excel Modal */}
      {showImportModal && (
        <ResponsiveModal
          isOpen={true}
          onClose={() => {
            setShowImportModal(false);
            setImportFile(null);
            setImportResult(null);
          }}
          title="Import sinh viên từ Excel"
          size="lg"
          footer={
            <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
              <button
                type="button"
                className="nb-btn nb-btn--ghost w-full sm:w-auto min-h-[44px] touch-manipulation order-2 sm:order-1"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
              >
                Đóng
              </button>
              {importFile && !importResult && (
                <button
                  type="button"
                  className="nb-btn nb-btn--primary w-full sm:w-auto min-h-[44px] touch-manipulation order-1 sm:order-2"
                  onClick={handleImportExcel}
                  disabled={importing}
                >
                  <span className="text-sm sm:text-base">{importing ? 'Đang import...' : 'Import'}</span>
                </button>
              )}
            </div>
          }
        >
          <div className="space-y-3 sm:space-y-4">
            {/* Download template */}
            <div className="p-3 sm:p-4 bg-edu-muted dark:bg-edu-dark-muted rounded-lg">
              <h3 className="text-sm sm:text-base font-semibold mb-2">Tải file mẫu</h3>
              <p className="text-xs sm:text-sm opacity-70 mb-3">
                Tải file Excel mẫu, điền thông tin sinh viên theo đúng định dạng
              </p>
              <button
                type="button"
                className="nb-btn nb-btn--secondary w-full sm:w-auto min-h-[44px] touch-manipulation"
                onClick={handleDownloadTemplate}
              >
                <span className="text-sm sm:text-base">Tải file mẫu Excel</span>
              </button>
            </div>

            {/* Upload file */}
            <div className="p-3 sm:p-4 border-2 border-dashed border-edu-border dark:border-edu-dark-border rounded-lg">
              <h3 className="text-sm sm:text-base font-semibold mb-2">Upload file Excel</h3>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImportFile(file);
                    setImportResult(null);
                  }
                }}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-edu-primary file:text-white hover:file:bg-edu-primary-hover min-h-[44px]"
              />
              {importFile && (
                <p className="mt-2 text-sm text-edu-accent dark:text-edu-dark-accent">
                  Đã chọn: {importFile.name}
                </p>
              )}
            </div>

            {/* Import result */}
            {importResult && (
              <div className="p-4 bg-edu-success-light dark:bg-edu-dark-muted rounded-lg">
                <h3 className="font-semibold text-edu-success dark:text-edu-dark-accent mb-2">
                  Kết quả import
                </h3>
                <ul className="text-sm space-y-1">
                  <li>Import thành công: {importResult.imported} sinh viên</li>
                  <li>Import thất bại: {importResult.failed}</li>
                </ul>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-1">Lỗi chi tiết:</p>
                    <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                      {importResult.errors.map((err, idx) => (
                        <li key={idx} className="text-edu-error dark:text-red-400">
                          • {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </ResponsiveModal>
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
    <ResponsiveModal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Sửa sinh viên' : 'Thêm sinh viên'}
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
            form="student-form"
            className="nb-btn nb-btn--primary min-h-[44px] w-full sm:w-auto touch-manipulation order-1 sm:order-2"
            disabled={isCreating || isUpdating}
          >
            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
          </button>
        </div>
      }
    >
      <form
        id="student-form"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <input
            className="nb-input min-h-[44px] touch-manipulation"
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
            className="nb-input min-h-[44px] touch-manipulation"
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
            className="nb-input min-h-[44px] touch-manipulation"
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
          <select className="nb-input min-h-[44px] touch-manipulation" {...register('classId')}>
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
            className="nb-input min-h-[44px] touch-manipulation"
            placeholder="Email"
            type="email"
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
            className="nb-input min-h-[44px] touch-manipulation"
            placeholder="Số điện thoại"
            type="tel"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">
              {errors.phone.message as string}
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <input
            className="nb-input min-h-[44px] touch-manipulation"
            placeholder="Địa chỉ"
            {...register('address')}
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-600">
              {errors.address.message as string}
            </p>
          )}
        </div>
      </form>
    </ResponsiveModal>
  );
}
