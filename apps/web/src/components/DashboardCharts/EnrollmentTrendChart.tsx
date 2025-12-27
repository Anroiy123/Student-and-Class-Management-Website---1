/**
 * Enrollment Trend Line Chart Component
 * Requirements: 3.1, 3.2, 3.3, 7.1, 7.2, 7.3, 7.4
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { EnrollmentTrendItem } from '../../lib/dashboard';
import { useTheme } from '../../lib/themeHooks';
import { useIsMobile } from '../../lib/useIsMobile';

type EnrollmentTrendChartProps = {
  data: EnrollmentTrendItem[];
};

// Chart height constants for responsive design (Requirements: 7.1, 7.2)
const CHART_HEIGHT_MOBILE = 200;
const CHART_HEIGHT_DESKTOP = 250;

export function EnrollmentTrendChart({ data }: EnrollmentTrendChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP;

  return (
    <div className="edu-card">
      <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">
        Xu hướng đăng ký môn học
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#334155' : '#E2E8F0'}
          />
          <XAxis
            dataKey="monthLabel"
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12 }}
            axisLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }}
            tickLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }}
          />
          <YAxis
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12 }}
            allowDecimals={false}
            axisLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }}
            tickLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as EnrollmentTrendItem;
                return (
                  <div
                    className={`px-3 py-2 rounded-lg shadow-elevated text-sm ${
                      isDark
                        ? 'bg-edu-dark-surface border border-edu-dark-border text-edu-dark-text'
                        : 'bg-white border border-edu-border text-edu-ink'
                    }`}
                  >
                    <p className="font-semibold">{item.monthLabel}</p>
                    <p>Số đăng ký: {item.count}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke={isDark ? '#60A5FA' : '#6366F1'}
            strokeWidth={2}
            dot={{
              fill: isDark ? '#60A5FA' : '#6366F1',
              stroke: 'transparent',
              strokeWidth: 0,
              r: 4,
            }}
            activeDot={{
              fill: isDark ? '#93C5FD' : '#818CF8',
              stroke: 'transparent',
              strokeWidth: 0,
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
