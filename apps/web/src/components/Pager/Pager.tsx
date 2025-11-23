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

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="nb-btn nb-btn--secondary"
        disabled={!canPrev}
        onClick={() => canPrev && onChangePage(page - 1)}
      >
        Trước
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={
            p === page ? 'nb-btn nb-btn--primary' : 'nb-btn nb-btn--ghost'
          }
          onClick={() => onChangePage(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className="nb-btn nb-btn--secondary"
        disabled={!canNext}
        onClick={() => canNext && onChangePage(page + 1)}
      >
        Sau
      </button>
    </div>
  );
}

