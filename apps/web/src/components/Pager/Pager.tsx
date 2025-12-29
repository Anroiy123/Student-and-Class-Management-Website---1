import { useMemo, useState, useEffect } from 'react';

export interface PagerProps {
  page: number;
  pageSize: number;
  total: number;
  onChangePage: (page: number) => void;
}

const MOBILE_BREAKPOINT = 640;

export function Pager({ page, pageSize, total, onChangePage }: PagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive window size: 3 on mobile, 5 on tablet, 7 on desktop
  const windowSize = isMobile ? 3 : 5;

  const pages = useMemo(() => {
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages, windowSize]);

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // Show ellipsis indicators
  const showStartEllipsis = pages[0] > 1;
  const showEndEllipsis = pages[pages.length - 1] < totalPages;

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
      aria-label="Điều hướng phân trang"
    >
      {/* Page info */}
      <div
        className="text-xs sm:text-sm text-edu-ink-light dark:text-edu-dark-text-dim text-center sm:text-left"
        aria-live="polite"
      >
        <span className="hidden sm:inline">Hiển thị </span>
        <span className="font-medium text-edu-ink dark:text-edu-dark-text">{startItem}-{endItem}</span>
        <span className="hidden sm:inline"> trong tổng số </span>
        <span className="sm:hidden"> / </span>
        <span className="font-medium text-edu-ink dark:text-edu-dark-text">{total}</span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1" role="group" aria-label="Các nút phân trang">
        {/* First page button - desktop only */}
        {!isMobile && showStartEllipsis && (
          <>
            <button
              type="button"
              className="edu-btn edu-btn--ghost px-2 sm:px-3 min-h-[40px] min-w-[40px]"
              onClick={() => onChangePage(1)}
              aria-label="Trang đầu"
            >
              1
            </button>
            <span className="px-1 text-edu-ink-light dark:text-edu-dark-text-dim">…</span>
          </>
        )}

        {/* Previous button */}
        <button
          type="button"
          className="edu-btn edu-btn--ghost px-2 sm:px-3 min-h-[40px] min-w-[40px]"
          disabled={!canPrev}
          onClick={() => canPrev && onChangePage(page - 1)}
          aria-label="Trang trước"
          aria-disabled={!canPrev}
        >
          <span aria-hidden="true">←</span>
        </button>

        {/* Page numbers */}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={
              p === page
                ? 'edu-btn edu-btn--primary px-2 sm:px-3 min-h-[40px] min-w-[40px]'
                : 'edu-btn edu-btn--ghost px-2 sm:px-3 min-h-[40px] min-w-[40px]'
            }
            onClick={() => onChangePage(p)}
            aria-label={`Trang ${p}${p === page ? ', trang hiện tại' : ''}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        {/* Next button */}
        <button
          type="button"
          className="edu-btn edu-btn--ghost px-2 sm:px-3 min-h-[40px] min-w-[40px]"
          disabled={!canNext}
          onClick={() => canNext && onChangePage(page + 1)}
          aria-label="Trang sau"
          aria-disabled={!canNext}
        >
          <span aria-hidden="true">→</span>
        </button>

        {/* Last page button - desktop only */}
        {!isMobile && showEndEllipsis && (
          <>
            <span className="px-1 text-edu-ink-light dark:text-edu-dark-text-dim">…</span>
            <button
              type="button"
              className="edu-btn edu-btn--ghost px-2 sm:px-3 min-h-[40px] min-w-[40px]"
              onClick={() => onChangePage(totalPages)}
              aria-label="Trang cuối"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Mobile: Quick jump */}
      {isMobile && totalPages > 5 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-edu-ink-light dark:text-edu-dark-text-dim">Đến trang:</span>
          <select
            value={page}
            onChange={(e) => onChangePage(Number(e.target.value))}
            className="edu-input py-1 px-2 w-16 text-center text-sm"
            aria-label="Chọn trang"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        Đang ở trang {page} trong tổng số {totalPages} trang
      </span>
    </nav>
  );
}
