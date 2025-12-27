import { useMemo } from 'react';

export interface PagerProps {
  page: number;
  pageSize: number;
  total: number;
  onChangePage: (page: number) => void;
}

export function Pager({ page, pageSize, total, onChangePage }: PagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pages = useMemo(() => {
    const windowSize = 7;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  // Calculate displayed range
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

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
        Hiển thị <span className="font-medium text-edu-ink dark:text-edu-dark-text">{startItem}-{endItem}</span> trong tổng số <span className="font-medium text-edu-ink dark:text-edu-dark-text">{total}</span> kết quả
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1" role="group" aria-label="Các nút phân trang">
        <button
          type="button"
          className="edu-btn edu-btn--ghost px-3"
          disabled={!canPrev}
          onClick={() => canPrev && onChangePage(page - 1)}
          aria-label="Trang trước"
          aria-disabled={!canPrev}
        >
          <span aria-hidden="true">←</span>
          <span className="hidden sm:inline"> Trước</span>
        </button>
        
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={
              p === page 
                ? 'edu-btn edu-btn--primary px-3.5' 
                : 'edu-btn edu-btn--ghost px-3.5'
            }
            onClick={() => onChangePage(p)}
            aria-label={`Trang ${p}${p === page ? ', trang hiện tại' : ''}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        
        <button
          type="button"
          className="edu-btn edu-btn--ghost px-3"
          disabled={!canNext}
          onClick={() => canNext && onChangePage(page + 1)}
          aria-label="Trang sau"
          aria-disabled={!canNext}
        >
          <span className="hidden sm:inline">Sau </span>
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

