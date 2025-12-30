import { useMemo } from 'react';
import { useBreakpoint, PAGER_MAX_BUTTONS } from '../../lib/responsive';
import { calculateVisiblePages } from './calculateVisiblePages';

export interface PagerProps {
  page: number;
  pageSize: number;
  total: number;
  onChangePage: (page: number) => void;
}

export function Pager({ page, pageSize, total, onChangePage }: PagerProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Get max buttons based on breakpoint
  const maxButtons = isMobile
    ? PAGER_MAX_BUTTONS.MOBILE
    : isTablet
      ? PAGER_MAX_BUTTONS.TABLET
      : PAGER_MAX_BUTTONS.DESKTOP;

  const pages = useMemo(
    () => calculateVisiblePages(page, totalPages, maxButtons),
    [page, totalPages, maxButtons]
  );

  // Calculate displayed range
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // Button base classes with touch target compliance (min 44x44px)
  const buttonBase =
    'min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors';

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4"
      aria-label="Điều hướng phân trang"
    >
      {/* Page info for screen readers and visual users */}
      <div
        className="text-sm text-edu-ink-light dark:text-edu-dark-text-dim"
        aria-live="polite"
        aria-atomic="true"
      >
        Hiển thị{' '}
        <span className="font-medium text-edu-ink dark:text-edu-dark-text">
          {startItem}-{endItem}
        </span>{' '}
        trong tổng số{' '}
        <span className="font-medium text-edu-ink dark:text-edu-dark-text">
          {total}
        </span>{' '}
        kết quả
      </div>

      {/* Pagination controls */}
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label="Các nút phân trang"
      >
        <button
          type="button"
          className={`edu-btn edu-btn--ghost ${buttonBase}`}
          disabled={!canPrev}
          onClick={() => canPrev && onChangePage(page - 1)}
          aria-label="Trang trước"
          aria-disabled={!canPrev}
        >
          <span aria-hidden="true">←</span>
          <span className="hidden sm:inline ml-1">Trước</span>
        </button>

        {pages.map((p, idx) => {
          if (p === 'ellipsis-start' || p === 'ellipsis-end') {
            return (
              <span
                key={p}
                className={`${buttonBase} text-edu-ink-light dark:text-edu-dark-text-dim select-none`}
                aria-hidden="true"
              >
                …
              </span>
            );
          }

          return (
            <button
              key={`page-${p}-${idx}`}
              type="button"
              className={`${buttonBase} ${
                p === page
                  ? 'edu-btn edu-btn--primary'
                  : 'edu-btn edu-btn--ghost'
              }`}
              onClick={() => onChangePage(p)}
              aria-label={`Trang ${p}${p === page ? ', trang hiện tại' : ''}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          className={`edu-btn edu-btn--ghost ${buttonBase}`}
          disabled={!canNext}
          onClick={() => canNext && onChangePage(page + 1)}
          aria-label="Trang sau"
          aria-disabled={!canNext}
        >
          <span className="hidden sm:inline mr-1">Sau</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only" role="status" aria-live="polite">
        Đang ở trang {page} trong tổng số {totalPages} trang
      </span>
    </nav>
  );
}
