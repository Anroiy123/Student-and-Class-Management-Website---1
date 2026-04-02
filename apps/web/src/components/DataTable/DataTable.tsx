import { flexRender, type Table } from '@tanstack/react-table';

export interface DataTableProps<TData> {
  table: Table<TData>;
  minWidth?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  showPagination?: boolean;
  paginationSlot?: React.ReactNode;
  overflowYHidden?: boolean;
  caption?: string;
  ariaLabel?: string;
}

/**
 * Reusable DataTable component for rendering TanStack Table instances
 * with professional design system styling
 * WCAG 2.1 AA Compliant with proper ARIA attributes
 */
export function DataTable<TData>({
  table,
  minWidth = '700px',
  isLoading = false,
  emptyMessage = 'Không có dữ liệu',
  showPagination = false,
  paginationSlot,
  overflowYHidden = false,
  caption,
  ariaLabel = 'Bảng dữ liệu',
}: DataTableProps<TData>) {
  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center gap-3 py-12"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="edu-loading-spinner" aria-hidden="true"></div>
        <p className="text-sm font-medium text-edu-ink-light dark:text-edu-dark-text-dim">Đang tải dữ liệu…</p>
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <div 
        className="text-center py-12"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm text-edu-ink-light dark:text-edu-dark-text-dim">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`overflow-x-auto ${overflowYHidden ? 'overflow-y-hidden' : ''} -mx-4 md:mx-0 rounded-lg border border-edu-border dark:border-edu-dark-border`}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <div style={{ minWidth }}>
          <table 
            className="w-full text-sm"
            aria-label={ariaLabel}
          >
            {caption && (
              <caption className="sr-only">{caption}</caption>
            )}
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                >
                  {hg.headers.map((header, idx) => (
                    <th
                      key={header.id}
                      scope="col"
                      className={`text-left px-4 py-3.5 font-semibold bg-edu-muted dark:bg-edu-dark-muted text-edu-ink-light dark:text-edu-dark-text-dim border-b border-edu-border dark:border-edu-dark-border ${
                        idx === 0 ? 'rounded-tl-lg' : ''
                      } ${
                        idx === hg.headers.length - 1 ? 'rounded-tr-lg' : ''
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
                    className={`border-b border-edu-border dark:border-edu-dark-border hover:bg-edu-muted dark:hover:bg-edu-dark-muted transition-colors ${
                      rowIdx % 2 === 0 ? 'bg-edu-surface dark:bg-edu-dark-surface' : 'bg-edu-muted/50 dark:bg-edu-dark-muted/50'
                    } ${isLastRow ? 'border-b-0' : ''}`}
                    tabIndex={0}
                  >
                    {row.getVisibleCells().map((cell, cellIdx) => (
                      <td
                        key={cell.id}
                        className={`px-4 py-3.5 ${
                          isLastRow && cellIdx === 0 ? 'rounded-bl-lg' : ''
                        } ${
                          isLastRow &&
                          cellIdx === row.getVisibleCells().length - 1
                            ? 'rounded-br-lg'
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
        <nav 
          className="mt-4 pt-4 border-t border-edu-border dark:border-edu-dark-border"
          aria-label="Phân trang bảng dữ liệu"
        >
          {paginationSlot}
        </nav>
      )}
    </>
  );
}
