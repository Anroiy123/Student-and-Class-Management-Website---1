/**
 * Shared chart state components for loading, error, and empty states
 * Requirements: 5.2, 5.3, 1.4, 2.4, 3.4, 4.4, 7.1, 7.2
 */

type ChartSkeletonProps = {
  height?: number;
};

export function ChartSkeleton({ height = 250 }: ChartSkeletonProps) {
  return (
    <div className="nb-card animate-pulse">
      <div className="h-5 w-32 bg-gray-200 dark:bg-nb-dark-border rounded mb-4" />
      {/* Responsive height: 200px on mobile (<768px), 250px on desktop */}
      <div
        className="bg-gray-100 dark:bg-nb-dark-bg rounded flex items-center justify-center h-[200px] md:h-[250px]"
        style={{ minHeight: height }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-nb-dark-border border-t-nb-lemon dark:border-t-nb-gold rounded-full animate-spin" />
          <span className="text-sm text-gray-400 dark:text-nb-dark-text-dim">
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
    <div className="nb-card flex flex-col items-center justify-center py-8">
      <div className="text-nb-coral text-4xl mb-2">⚠️</div>
      <p className="text-nb-coral dark:text-nb-coral mb-4 font-medium">
        {message}
      </p>
      <button onClick={onRetry} className="nb-btn nb-btn--secondary">
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
    <div className="nb-card flex flex-col items-center justify-center py-8">
      <div className="text-4xl mb-2 opacity-50">📊</div>
      <p className="text-sm opacity-70 dark:text-nb-dark-text-dim text-center">
        {message}
      </p>
    </div>
  );
}
