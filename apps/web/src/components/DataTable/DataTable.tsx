import { flexRender, type Table, type Row } from '@tanstack/react-table';
import { useBreakpoint } from '../../lib/responsive';

export interface MobileCardConfig<TData> {
  /** Field to use as main identifier (e.g., 'mssv', 'code') */
  keyField: keyof TData | string;
  /** Field to use as subtitle (e.g., 'fullName', 'name') */
  subtitleField?: keyof TData | string;
  /** Column IDs to show in card body (if not specified, shows all except key, subtitle, stt, actions) */
  bodyFields?: string[];
  /** Column ID for actions (buttons) - will be rendered in card footer */
  actionsColumnId?: string;
}

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
  /** Columns to hide on mobile when in table view (by column id) */
  hiddenOnMobile?: string[];
  /** Columns to hide on tablet (by column id) */
  hiddenOnTablet?: string[];
  /** Enable mobile card view instead of table on mobile */
  enableMobileCards?: boolean;
  /** Configuration for mobile card view */
  mobileCardConfig?: MobileCardConfig<TData>;
  /** Custom mobile card renderer (overrides default) */
  mobileCardRenderer?: (
    row: Row<TData>,
    index: number,
    startIndex: number
  ) => React.ReactNode;
}

/**
 * Default mobile card renderer
 */
function DefaultMobileCard<TData>({
  row,
  index,
  startIndex,
  config,
}: {
  row: Row<TData>;
  index: number;
  startIndex: number;
  config: MobileCardConfig<TData>;
}) {
  const cells = row.getVisibleCells();
  const data = row.original as Record<string, unknown>;

  // Get key value
  const keyValue = data[config.keyField as string] ?? '';
  // Get subtitle value
  const subtitleValue = config.subtitleField
    ? data[config.subtitleField as string]
    : null;

  // Determine which fields to show in body
  const excludeFields = new Set([
    'stt',
    config.keyField as string,
    config.subtitleField as string,
    config.actionsColumnId ?? 'actions',
  ]);

  const bodyFields = config.bodyFields
    ? cells.filter((cell) => config.bodyFields!.includes(cell.column.id))
    : cells.filter((cell) => !excludeFields.has(cell.column.id));

  // Get actions cell
  const actionsCell = cells.find(
    (cell) => cell.column.id === (config.actionsColumnId ?? 'actions')
  );

  return (
    <div className="bg-edu-surface dark:bg-edu-dark-surface border border-edu-border dark:border-edu-dark-border rounded-lg overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-edu-muted dark:bg-edu-dark-muted border-b border-edu-border dark:border-edu-dark-border">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-edu-primary text-white text-sm font-bold">
            {startIndex + index + 1}
          </span>
          <div>
            <div className="font-semibold text-edu-ink dark:text-edu-dark-text">
              {String(keyValue)}
            </div>
            {subtitleValue != null && (
              <div className="text-sm text-edu-ink-light dark:text-edu-dark-text-dim">
                {String(subtitleValue)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      {bodyFields.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          {bodyFields.map((cell) => {
            const header = cell.column.columnDef.header;
            const headerText =
              typeof header === 'string'
                ? header
                : typeof header === 'function'
                  ? ''
                  : '';

            return (
              <div
                key={cell.id}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <span className="text-edu-ink-light dark:text-edu-dark-text-dim shrink-0">
                  {headerText}:
                </span>
                <span className="text-edu-ink dark:text-edu-dark-text text-right">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Card Footer - Actions */}
      {actionsCell && (
        <div className="px-4 py-3 border-t border-edu-border dark:border-edu-dark-border bg-edu-muted/50 dark:bg-edu-dark-muted/50">
          {flexRender(
            actionsCell.column.columnDef.cell,
            actionsCell.getContext()
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Reusable DataTable component for rendering TanStack Table instances
 * with professional design system styling and responsive mobile card view
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
  hiddenOnMobile = [],
  hiddenOnTablet = [],
  enableMobileCards = false,
  mobileCardConfig,
  mobileCardRenderer,
}: DataTableProps<TData>) {
  const { isMobile, isTablet } = useBreakpoint();

  // Determine hidden columns based on breakpoint
  const hiddenColumns = new Set<string>();
  if (isMobile) {
    hiddenOnMobile.forEach((col) => hiddenColumns.add(col));
  }
  if (isTablet) {
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
        <p className="text-sm text-edu-ink-light dark:text-edu-dark-text-dim">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Calculate start index for row numbering (useful for pagination)
  const startIndex = 0; // This could be passed as prop if needed

  // Render mobile card view
  if (isMobile && enableMobileCards && mobileCardConfig) {
    return (
      <>
        <div
          className="space-y-3"
          role="list"
          aria-label={ariaLabel}
        >
          {rows.map((row, idx) =>
            mobileCardRenderer ? (
              <div key={row.id} role="listitem">
                {mobileCardRenderer(row, idx, startIndex)}
              </div>
            ) : (
              <div key={row.id} role="listitem">
                <DefaultMobileCard
                  row={row}
                  index={idx}
                  startIndex={startIndex}
                  config={mobileCardConfig}
                />
              </div>
            )
          )}
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

  // Render table view (desktop/tablet or mobile without cards)
  return (
    <>
      <div
        className={`overflow-x-auto ${overflowYHidden ? 'overflow-y-hidden' : ''} -mx-4 sm:mx-0 rounded-lg border border-edu-border dark:border-edu-dark-border`}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <div style={{ minWidth: isMobile ? 'auto' : minWidth }}>
          <table className="w-full text-sm" aria-label={ariaLabel}>
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead>
              {table.getHeaderGroups().map((hg) => {
                const visibleHeaders = hg.headers.filter(
                  (h) => !hiddenColumns.has(h.id)
                );
                return (
                  <tr key={hg.id}>
                    {visibleHeaders.map((header, idx) => (
                      <th
                        key={header.id}
                        scope="col"
                        className={`text-left px-4 py-3.5 font-semibold bg-edu-muted dark:bg-edu-dark-muted text-edu-ink-light dark:text-edu-dark-text-dim border-b border-edu-border dark:border-edu-dark-border ${
                          idx === 0 ? 'rounded-tl-lg' : ''
                        } ${
                          idx === visibleHeaders.length - 1
                            ? 'rounded-tr-lg'
                            : ''
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
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                );
              })}
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => {
                const isLastRow = rowIdx === rows.length - 1;
                const visibleCells = row
                  .getVisibleCells()
                  .filter((c) => !hiddenColumns.has(c.column.id));

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
                    {visibleCells.map((cell, cellIdx) => (
                      <td
                        key={cell.id}
                        className={`px-4 py-3.5 ${
                          isLastRow && cellIdx === 0 ? 'rounded-bl-lg' : ''
                        } ${
                          isLastRow && cellIdx === visibleCells.length - 1
                            ? 'rounded-br-lg'
                            : ''
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
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
