import { flexRender, type Table } from '@tanstack/react-table';
import { useState, useEffect } from 'react';

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
  /** Columns to hide on mobile (by column id) */
  hiddenOnMobile?: string[];
  /** Columns to hide on tablet (by column id) */
  hiddenOnTablet?: string[];
}

const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1024;

/**
 * Reusable DataTable component for rendering TanStack Table instances
 * with professional design system styling and responsive column hiding
 * WCAG 2.1 AA Compliant with proper ARIA attributes
 */
export function DataTable<TData>({
  table,
  minWidth = '600px',
  isLoading = false,
  emptyMessage = 'Không có dữ liệu',
  showPagination = false,
  paginationSlot,
  overflowYHidden = false,
  caption,
  ariaLabel = 'Bảng dữ liệu',
  hiddenOnMobile = [],
  hiddenOnTablet = [],
}: DataTableProps<TData>) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    if (window.innerWidth < MOBILE_BREAKPOINT) return 'mobile';
    if (window.innerWidth < TABLET_BREAKPOINT) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) setScreenSize('mobile');
      else if (window.innerWidth < TABLET_BREAKPOINT) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine which columns to hide based on screen size
  const hiddenColumns = new Set<string>();
  if (screenSize === 'mobile') {
    hiddenOnMobile.forEach((col) => hiddenColumns.add(col));
    hiddenOnTablet.forEach((col) => hiddenColumns.add(col));
  } else if (screenSize === 'tablet') {
    hiddenOnTablet.forEach((col) => hiddenColumns.add(col));
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-3 py-12"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="edu-loading-spinner" aria-hidden="true"></div>
        <p className="text-sm font-medium text-edu-ink-light dark:text-edu-dark-text-dim">
          Đang tải dữ liệu…
        </p>
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <div className="text-center py-12" role="status" aria-live="polite">
        <p className="text-sm text-edu-ink-light dark:text-edu-dark-text-dim">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`overflow-x-auto ${overflowYHidden ? 'overflow-y-hidden' : ''} -mx-4 sm:mx-0 rounded-lg border border-edu-border dark:border-edu-dark-border`}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <div style={{ minWidth: screenSize === 'mobile' ? 'auto' : minWidth }}>
          <table className="w-full text-sm" aria-label={ariaLabel}>
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header, idx) => {
                    // Skip hidden columns
                    if (hiddenColumns.has(header.id)) return null;

                    return (
                      <th
                        key={header.id}
                        scope="col"
                        className={`text-left px-3 sm:px-4 py-3 font-semibold bg-edu-muted dark:bg-edu-dark-muted text-edu-ink-light dark:text-edu-dark-text-dim border-b border-edu-border dark:border-edu-dark-border text-xs sm:text-sm ${
                          idx === 0 ? 'rounded-tl-lg' : ''
                        } ${idx === hg.headers.length - 1 ? 'rounded-tr-lg' : ''}`}
                        style={{
                          width: header.column.columnDef.size
                            ? `${header.column.columnDef.size}px`
                            : 'auto',
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
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
                      rowIdx % 2 === 0
                        ? 'bg-edu-surface dark:bg-edu-dark-surface'
                        : 'bg-edu-muted/50 dark:bg-edu-dark-muted/50'
                    } ${isLastRow ? 'border-b-0' : ''}`}
                    tabIndex={0}
                  >
                    {row.getVisibleCells().map((cell, cellIdx) => {
                      // Skip hidden columns
                      if (hiddenColumns.has(cell.column.id)) return null;

                      const visibleCells = row.getVisibleCells().filter(
                        (c) => !hiddenColumns.has(c.column.id)
                      );
                      const isFirstVisible = cellIdx === 0 || 
                        row.getVisibleCells().slice(0, cellIdx).every((c) => hiddenColumns.has(c.column.id));
                      const isLastVisible = cellIdx === visibleCells.length - 1;

                      return (
                        <td
                          key={cell.id}
                          className={`px-3 sm:px-4 py-3 text-xs sm:text-sm ${
                            isLastRow && isFirstVisible ? 'rounded-bl-lg' : ''
                          } ${isLastRow && isLastVisible ? 'rounded-br-lg' : ''}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showPagination && paginationSlot && (
        <div className="mt-4 sm:mt-6 pt-4 border-t border-edu-border dark:border-edu-dark-border">
          {paginationSlot}
        </div>
      )}
    </>
  );
}
