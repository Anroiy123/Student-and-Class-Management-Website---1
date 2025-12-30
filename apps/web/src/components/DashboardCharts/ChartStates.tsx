/**
 * Shared chart state components for loading, error, and empty states
 * Requirements: 5.2, 5.3, 1.4, 2.4, 3.4, 4.4, 7.1, 7.2
 */

type ChartSkeletonProps = {
  height?: number;
};

export function ChartSkeleton({ height = 250 }: ChartSkeletonProps) {
  return (
    <div className="edu-card animate-pulse">
      <div className="h-5 w-32 bg-edu-muted dark:bg-edu-dark-muted rounded mb-4" />
      {/* Responsive height: 200px on mobile (<768px), 250px on desktop */}
      <div
        className="bg-edu-muted dark:bg-edu-dark-muted rounded-lg flex items-center justify-center h-[200px] md:h-[250px]"
        style={{ minHeight: height }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-3 border-edu-border dark:border-edu-dark-border border-t-edu-primary dark:border-t-edu-dark-primary rounded-full animate-spin" />
          <span className="text-sm text-edu-ink-muted dark:text-edu-dark-text-dim">
            Đang tải...
          </span>
        </div>
      </div>
    </div>
  );
}

type ChartErrorProps = {
  onRetry: () => void;
  message?: string;
};

export function ChartError({
  onRetry,
  message = 'Không thể tải dữ liệu',
}: ChartErrorProps) {
  return (
    <div className="edu-card flex flex-col items-center justify-center py-8">
      <div className="w-12 h-12 rounded-full bg-edu-error-light flex items-center justify-center mb-3">
        <span className="text-edu-error text-xl">!</span>
      </div>
      <p className="text-edu-error mb-4 font-medium text-sm">
        {message}
      </p>
      <button onClick={onRetry} className="edu-btn edu-btn--ghost text-sm">
        Thử lại
      </button>
    </div>
  );
}

type ChartEmptyProps = {
  message: string;
};

export function ChartEmpty({ message }: ChartEmptyProps) {
  return (
    <div className="edu-card flex flex-col items-center justify-center py-8">
      <div className="w-12 h-12 rounded-full bg-edu-muted dark:bg-edu-dark-muted flex items-center justify-center mb-3">
        <span className="text-edu-ink-muted dark:text-edu-dark-text-dim text-xl">📊</span>
      </div>
      <p className="text-sm text-edu-ink-light dark:text-edu-dark-text-dim text-center">
        {message}
      </p>
    </div>
  );
}
