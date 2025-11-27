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
    <div className="nb-card">
      <h3 className="font-display font-semibold text-lg mb-4">
        Xu hướng đăng ký môn học
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#4a4a4a' : '#ddd'}
          />
          <XAxis
            dataKey="monthLabel"
            tick={{ fill: isDark ? '#e5e5e5' : '#111', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: isDark ? '#e5e5e5' : '#111', fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as EnrollmentTrendItem;
                return (
                  <div
                    className={`px-3 py-2 border-2 rounded shadow-neo-sm ${
                      isDark
                        ? 'bg-nb-dark-section border-nb-dark-border text-nb-dark-text'
                        : 'bg-white border-black'
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
            stroke={isDark ? '#D4AF37' : '#7868D8'}
            strokeWidth={3}
            dot={{
              fill: isDark ? '#D4AF37' : '#7868D8',
              stroke: isDark ? '#393947' : '#111',
              strokeWidth: 2,
              r: 5,
            }}
            activeDot={{
              fill: isDark ? '#e5c350' : '#FFE76A',
              stroke: isDark ? '#393947' : '#111',
              strokeWidth: 2,
              r: 7,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
