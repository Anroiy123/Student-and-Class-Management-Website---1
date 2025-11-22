import { flexRender, type Table } from '@tanstack/react-table';

export interface DataTableProps<TData> {
  table: Table<TData>;
  minWidth?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  showPagination?: boolean;
  paginationSlot?: React.ReactNode;
}

/**
 * Reusable DataTable component for rendering TanStack Table instances
 * with consistent Neobrutalism design system styling
 */
export function DataTable<TData>({
  table,
  minWidth = '700px',
  isLoading = false,
  emptyMessage = 'Không có dữ liệu',
  showPagination = false,
  paginationSlot,
}: DataTableProps<TData>) {
  if (isLoading) {
    return <p className="text-sm opacity-70">Đang tải dữ liệu…</p>;
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold opacity-70">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div style={{ minWidth }}>
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
              {rows.map((row, idx) => (
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
      {showPagination && paginationSlot && (
        <div className="mt-6 pt-4 border-t-3 border-black dark:border-[#4a4a4a]">
          {paginationSlot}
        </div>
      )}
    </>
  );
}

