import { useMemo, useState, useRef, useEffect } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/table-core';
import { DataTable } from '../components/DataTable';
import { Pager } from '../components/Pager';
import {
  useUsers,
  useApproveUser,
  useLockUser,
  useUnlockUser,
  useLinkAccount,
  useDeleteUser,
  useUnlinkedStudents,
  useUnlinkedTeachers,
  type UserListItem,
  type UserStatus,
} from '../lib/users';

// Searchable Select Component
interface SearchableSelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  emptyMessage = 'Không tìm thấy kết quả',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerSearch) ||
        opt.subLabel?.toLowerCase().includes(lowerSearch),
    );
  }, [options, search]);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="nb-input w-full flex items-center gap-2 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        ) : (
          <span
            className={`flex-1 truncate ${!selectedOption ? 'text-gray-400' : ''}`}
          >
            {selectedOption
              ? `${selectedOption.label}${selectedOption.subLabel ? ` - ${selectedOption.subLabel}` : ''}`
              : placeholder}
          </span>
        )}
        {value && !isOpen && (
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          >
            ✕
          </button>
        )}
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-nb-dark-card border-3 border-nb-ink dark:border-nb-dark-border shadow-neo max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={`px-3 py-2 cursor-pointer hover:bg-nb-yellow dark:hover:bg-nb-dark-hover transition-colors ${
                  opt.value === value
                    ? 'bg-nb-yellow dark:bg-nb-dark-hover font-medium'
                    : ''
                }`}
                onClick={() => handleSelect(opt.value)}
              >
                <div className="font-medium">{opt.label}</div>
                {opt.subLabel && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {opt.subLabel}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

type TabKey = 'PENDING' | 'ACTIVE' | 'LOCKED';

const TABS: { key: TabKey; label: string; status: UserStatus }[] = [
  { key: 'PENDING', label: 'Chờ duyệt', status: 'PENDING' },
  { key: 'ACTIVE', label: 'Đã kích hoạt', status: 'ACTIVE' },
  { key: 'LOCKED', label: 'Đang khóa', status: 'LOCKED' },
];

export const UsersPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('PENDING');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const currentStatus = TABS.find((t) => t.key === activeTab)?.status;

  const { data, isLoading } = useUsers({
    status: currentStatus,
    page,
    pageSize,
    search: search || undefined,
  });

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  const { mutateAsync: approveMutate } = useApproveUser();
  const { mutateAsync: lockMutate } = useLockUser();
  const { mutateAsync: unlockMutate } = useUnlockUser();
  const { mutateAsync: linkMutate } = useLinkAccount();
  const { mutateAsync: deleteMutate } = useDeleteUser();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        id: 'stt',
        header: 'STT',
        cell: (info) => (page - 1) * pageSize + info.row.index + 1,
        size: 50,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 200,
      },
      {
        accessorKey: 'role',
        header: 'Vai trò',
        cell: (info) => {
          const role = info.getValue() as string;
          const roleMap = {
            ADMIN: 'Quản trị',
            TEACHER: 'Giáo viên',
            STUDENT: 'Sinh viên',
          };
          return roleMap[role as keyof typeof roleMap] || role;
        },
        size: 100,
      },
      {
        id: 'linked',
        header: 'Liên kết',
        cell: (info) => {
          const { studentId, teacherId } = info.row.original;
          if (studentId) return `SV: ${studentId.mssv} - ${studentId.fullName}`;
          if (teacherId)
            return `GV: ${teacherId.employeeId} - ${teacherId.fullName}`;
          return '-';
        },
        size: 250,
      },
      {
        id: 'createdAt',
        header: 'Ngày tạo',
        cell: (info) => {
          const v = info.row.original.createdAt;
          if (!v) return '-';
          const d = new Date(v);
          return isNaN(d.getTime()) ? v : d.toLocaleDateString('vi-VN');
        },
        size: 100,
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: (info) => {
          const user = info.row.original;
          return (
            <div className="flex gap-1 flex-wrap">
              {activeTab === 'PENDING' && (
                <>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs border-2 border-black bg-nb-mint hover:bg-nb-lemon transition-all hover:shadow-neo-sm font-medium dark:border-nb-dark-border"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowApproveModal(true);
                    }}
                  >
                    Duyệt
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs border-2 border-black bg-nb-coral hover:bg-nb-lemon transition-all hover:shadow-neo-sm disabled:opacity-50 font-medium dark:border-nb-dark-border"
                    disabled={deletingId === user._id}
                    onClick={async () => {
                      if (
                        !window.confirm('Bạn có chắc muốn xóa tài khoản này?')
                      )
                        return;
                      try {
                        setDeletingId(user._id);
                        await deleteMutate(user._id);
                      } catch {
                        alert('Xóa thất bại. Vui lòng thử lại.');
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                  >
                    {deletingId === user._id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </>
              )}
              {activeTab === 'ACTIVE' && (
                <>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs border-2 border-black bg-nb-coral hover:bg-nb-lemon transition-all hover:shadow-neo-sm font-medium dark:border-nb-dark-border"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowLockModal(true);
                    }}
                  >
                    Khóa
                  </button>
                  {!user.studentId && !user.teacherId && (
                    <button
                      type="button"
                      className="px-3 py-1 text-xs border-2 border-black bg-nb-sky hover:bg-nb-lemon transition-all hover:shadow-neo-sm font-medium dark:border-nb-dark-border"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowLinkModal(true);
                      }}
                    >
                      Liên kết
                    </button>
                  )}
                </>
              )}
              {activeTab === 'LOCKED' && (
                <>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs border-2 border-black bg-nb-mint hover:bg-nb-lemon transition-all hover:shadow-neo-sm font-medium dark:border-nb-dark-border"
                    onClick={async () => {
                      if (
                        !window.confirm(
                          'Bạn có chắc muốn mở khóa tài khoản này?',
                        )
                      )
                        return;
                      try {
                        await unlockMutate(user._id);
                      } catch {
                        alert('Mở khóa thất bại. Vui lòng thử lại.');
                      }
                    }}
                  >
                    Mở khóa
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs border-2 border-black bg-nb-coral hover:bg-nb-lemon transition-all hover:shadow-neo-sm disabled:opacity-50 font-medium dark:border-nb-dark-border"
                    disabled={deletingId === user._id}
                    onClick={async () => {
                      if (
                        !window.confirm('Bạn có chắc muốn xóa tài khoản này?')
                      )
                        return;
                      try {
                        setDeletingId(user._id);
                        await deleteMutate(user._id);
                      } catch {
                        alert('Xóa thất bại. Vui lòng thử lại.');
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                  >
                    {deletingId === user._id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </>
              )}
            </div>
          );
        },
        size: 200,
      },
    ],
    [activeTab, page, pageSize, deletingId, deleteMutate, unlockMutate],
  );

  const table = useReactTable({
    data: (data?.items ?? []) as UserListItem[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="space-y-6">
      <header className="nb-card--flat">
        <h1 className="text-2xl md:text-3xl font-bold">Quản lý tài khoản</h1>
        <p className="mt-1 text-sm opacity-70">
          Duyệt, khóa, mở khóa và liên kết tài khoản người dùng
        </p>
      </header>

      <div className="nb-card">
        <div className="flex gap-2 border-b-2 border-black pb-2 mb-4 dark:border-nb-dark-border">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`px-4 py-2 text-sm font-medium border-2 border-black rounded-md transition-all ${
                activeTab === tab.key
                  ? 'bg-nb-lemon shadow-neo-sm dark:bg-nb-gold'
                  : 'bg-white hover:bg-nb-sky dark:bg-nb-dark-section dark:border-nb-dark-border'
              }`}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo email..."
            className="nb-input w-full md:w-96"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {isLoading ? (
          <p className="text-sm opacity-70">Đang tải danh sách tài khoản…</p>
        ) : data && data.items.length > 0 ? (
          <DataTable
            table={table}
            minWidth="900px"
            isLoading={false}
            emptyMessage="Không có tài khoản nào"
            showPagination={true}
            overflowYHidden={true}
            paginationSlot={
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm font-semibold px-3 py-2 bg-nb-lemon border-2 border-black inline-block rounded dark:bg-nb-dark-section dark:border-nb-dark-border dark:text-nb-dark-text">
                  Tổng: <span className="font-bold">{data.total}</span> tài
                  khoản
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
              Không có tài khoản nào
            </p>
          </div>
        )}
      </div>

      {showApproveModal && selectedUser && (
        <ApproveModal
          user={selectedUser}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedUser(null);
          }}
          onSubmit={async (body) => {
            try {
              await approveMutate({ id: selectedUser._id, body });
              setShowApproveModal(false);
              setSelectedUser(null);
              alert('Duyệt tài khoản thành công');
            } catch {
              alert('Duyệt thất bại. Vui lòng thử lại.');
            }
          }}
        />
      )}

      {showLockModal && selectedUser && (
        <LockModal
          user={selectedUser}
          onClose={() => {
            setShowLockModal(false);
            setSelectedUser(null);
          }}
          onSubmit={async (reason) => {
            try {
              await lockMutate({ id: selectedUser._id, reason });
              setShowLockModal(false);
              setSelectedUser(null);
              alert('Khóa tài khoản thành công');
            } catch {
              alert('Khóa thất bại. Vui lòng thử lại.');
            }
          }}
        />
      )}

      {showLinkModal && selectedUser && (
        <LinkModal
          user={selectedUser}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedUser(null);
          }}
          onSubmit={async (body) => {
            try {
              await linkMutate({ id: selectedUser._id, body });
              setShowLinkModal(false);
              setSelectedUser(null);
              alert('Liên kết tài khoản thành công');
            } catch {
              alert('Liên kết thất bại. Vui lòng thử lại.');
            }
          }}
        />
      )}
    </section>
  );
};

function ApproveModal({
  user,
  onClose,
  onSubmit,
}: {
  user: UserListItem;
  onClose: () => void;
  onSubmit: (body: { studentId?: string; teacherId?: string }) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: students } = useUnlinkedStudents();
  const { data: teachers } = useUnlinkedTeachers();

  const isStudent = user.role === 'STUDENT';
  const isTeacher = user.role === 'TEACHER';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body: { studentId?: string; teacherId?: string } = {};
      if (selectedId) {
        if (isStudent) body.studentId = selectedId;
        if (isTeacher) body.teacherId = selectedId;
      }
      await onSubmit(body);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="nb-card max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Duyệt tài khoản</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="text"
              className="nb-input w-full"
              value={user.email}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vai trò</label>
            <input
              type="text"
              className="nb-input w-full"
              value={
                user.role === 'ADMIN'
                  ? 'Quản trị'
                  : user.role === 'TEACHER'
                    ? 'Giáo viên'
                    : 'Sinh viên'
              }
              disabled
            />
          </div>
          {(isStudent || isTeacher) && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Liên kết với {isStudent ? 'Sinh viên' : 'Giáo viên'} (tùy chọn)
              </label>
              <SearchableSelect
                options={
                  isStudent
                    ? (students ?? []).map((s) => ({
                        value: s._id,
                        label: s.mssv,
                        subLabel: s.fullName,
                      }))
                    : (teachers ?? []).map((t) => ({
                        value: t._id,
                        label: t.employeeId,
                        subLabel: t.fullName,
                      }))
                }
                value={selectedId}
                onChange={setSelectedId}
                placeholder={`Tìm ${isStudent ? 'MSSV hoặc tên sinh viên' : 'mã GV hoặc tên giáo viên'}...`}
                emptyMessage="Không tìm thấy kết quả"
              />
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="nb-btn nb-btn--ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="nb-btn nb-btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang duyệt...' : 'Duyệt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LockModal({
  user,
  onClose,
  onSubmit,
}: {
  user: UserListItem;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do khóa');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="nb-card max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Khóa tài khoản</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="text"
              className="nb-input w-full"
              value={user.email}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Lý do khóa <span className="text-red-500">*</span>
            </label>
            <textarea
              className="nb-input w-full"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do khóa tài khoản..."
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="nb-btn nb-btn--ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="nb-btn nb-btn--danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang khóa...' : 'Khóa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LinkModal({
  user,
  onClose,
  onSubmit,
}: {
  user: UserListItem;
  onClose: () => void;
  onSubmit: (body: { studentId?: string; teacherId?: string }) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: students } = useUnlinkedStudents();
  const { data: teachers } = useUnlinkedTeachers();

  const isStudent = user.role === 'STUDENT';
  const isTeacher = user.role === 'TEACHER';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      alert('Vui lòng chọn tài khoản để liên kết');
      return;
    }
    setIsSubmitting(true);
    try {
      const body: { studentId?: string; teacherId?: string } = {};
      if (isStudent) body.studentId = selectedId;
      if (isTeacher) body.teacherId = selectedId;
      await onSubmit(body);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="nb-card max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Liên kết tài khoản</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="text"
              className="nb-input w-full"
              value={user.email}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Chọn {isStudent ? 'Sinh viên' : 'Giáo viên'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={
                isStudent
                  ? (students ?? []).map((s) => ({
                      value: s._id,
                      label: s.mssv,
                      subLabel: s.fullName,
                    }))
                  : (teachers ?? []).map((t) => ({
                      value: t._id,
                      label: t.employeeId,
                      subLabel: t.fullName,
                    }))
              }
              value={selectedId}
              onChange={setSelectedId}
              placeholder={`Tìm ${isStudent ? 'MSSV hoặc tên sinh viên' : 'mã GV hoặc tên giáo viên'}...`}
              emptyMessage="Không tìm thấy kết quả"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="nb-btn nb-btn--ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="nb-btn nb-btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang liên kết...' : 'Liên kết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
