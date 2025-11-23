import { flexRender, type Table } from '@tanstack/react-table';

export interface DataTableProps<TData> {
  table: Table<TData>;
  minWidth?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  showPagination?: boolean;
  paginationSlot?: React.ReactNode;
  overflowYHidden?: boolean;
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
  overflowYHidden = false,
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
      <div
        className={`overflow-x-auto ${overflowYHidden ? 'overflow-y-hidden' : ''} -mx-4 md:mx-0 md:rounded-xl`}
      >
        <div style={{ minWidth }}>
          <table className="w-full text-sm overflow-hidden md:rounded-xl">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                  className="border-b-3 border-black dark:border-nb-dark-border"
                >
                  {hg.headers.map((header, idx) => (
                    <th
                      key={header.id}
                      className={`text-left px-3 py-3 font-bold bg-nb-lemon ${
                        idx === 0 ? 'md:rounded-tl-xl' : ''
                      } ${
                        idx === hg.headers.length - 1 ? 'md:rounded-tr-xl' : ''
                      }`}
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
              {rows.map((row, rowIdx) => {
                const isLastRow = rowIdx === rows.length - 1;
                return (
                  <tr
                    key={row.id}
                    className={`border-b-2 border-black dark:border-nb-dark-border hover:bg-nb-sky/30 transition-colors ${
                      rowIdx % 2 === 0 ? 'bg-white' : 'bg-nb-paper'
                    } ${isLastRow ? 'border-b-0' : ''}`}
                  >
                    {row.getVisibleCells().map((cell, cellIdx) => (
                      <td
                        key={cell.id}
                        className={`px-3 py-3 ${
                          isLastRow && cellIdx === 0 ? 'md:rounded-bl-xl' : ''
                        } ${
                          isLastRow &&
                          cellIdx === row.getVisibleCells().length - 1
                            ? 'md:rounded-br-xl'
                            : ''
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showPagination && paginationSlot && (
        <div className="mt-6 pt-4 border-t-3 border-black dark:border-nb-dark-border">
          {paginationSlot}
        </div>
      )}
    </>
  );
}
