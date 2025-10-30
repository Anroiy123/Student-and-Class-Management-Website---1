import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

export interface GradeRow {
  _id: string;
  enrollmentId: string;
  mssv: string;
  studentName: string;
  courseCode: string;
  courseName: string;
  className: string;
  semester: string;
  attendance: number;
  midterm: number;
  final: number;
  total: number;
}

interface GradeTableProps {
  data: GradeRow[];
  onEdit: (grade: GradeRow) => void;
}

export const GradeTable = ({ data, onEdit }: GradeTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const getGradeColor = (grade: number) => {
    if (grade >= 8.5) return "from-green-500 to-emerald-600";
    if (grade >= 7.0) return "from-blue-500 to-indigo-600";
    if (grade >= 5.5) return "from-amber-500 to-orange-600";
    if (grade >= 4.0) return "from-orange-500 to-red-500";
    return "from-red-500 to-pink-600";
  };

  const getGradeLabel = (grade: number) => {
    if (grade >= 8.5) return "Giỏi";
    if (grade >= 7.0) return "Khá";
    if (grade >= 5.5) return "TB";
    if (grade >= 4.0) return "Yếu";
    return "Kém";
  };

  const columns: ColumnDef<GradeRow>[] = [
    {
      accessorKey: "mssv",
      header: "MSSV",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md">
            {row.original.mssv?.slice(-2) || "??"}
          </div>
          <span className="font-mono font-bold text-gray-700">
            {row.original.mssv || "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "studentName",
      header: "Sinh viên",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {row.original.studentName?.charAt(0) || "?"}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{row.original.studentName || "N/A"}</div>
            <div className="text-xs text-gray-500">{row.original.className || "Chưa có lớp"}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "courseName",
      header: "Môn học",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-gray-800">{row.original.courseName || "N/A"}</div>
          <div className="text-xs text-gray-500 font-mono">{row.original.courseCode || "N/A"}</div>
        </div>
      ),
    },
    {
      accessorKey: "semester",
      header: "Học kỳ",
      cell: ({ row }) => (
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-semibold text-sm">
          {row.original.semester || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "attendance",
      header: "CC (10%)",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-700">
            {row.original.attendance?.toFixed(1) || "0.0"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "midterm",
      header: "GK (30%)",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold">
            {row.original.midterm?.toFixed(1) || "0.0"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "final",
      header: "CK (60%)",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-bold">
            {row.original.final?.toFixed(1) || "0.0"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: "Tổng kết",
      cell: ({ row }) => {
        const total = row.original.total || 0;
        return (
          <div className="flex items-center gap-2">
            <div className={`bg-gradient-to-r ${getGradeColor(total)} text-white px-4 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2`}>
              <span className="text-lg">{total.toFixed(2)}</span>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {getGradeLabel(total)}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <button
          onClick={() => onEdit(row.original)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          title="Sửa điểm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm (MSSV, tên sinh viên, môn học)..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 bg-white font-medium"
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-bold text-gray-700">{table.getFilteredRowModel().rows.length}</span>
          <span className="text-sm text-gray-500">bản ghi</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors duration-200"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span>
                            {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">Chưa có điểm nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-amber-50 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
