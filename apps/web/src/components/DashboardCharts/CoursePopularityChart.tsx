/**
 * Course Popularity Horizontal Bar Chart Component
 * Requirements: 4.1, 4.2, 4.3, 7.1, 7.2, 7.3, 7.4
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { CoursePopularityItem } from '../../lib/dashboard';
import { useTheme } from '../../lib/themeHooks';
import { useIsMobile } from '../../lib/useIsMobile';

type CoursePopularityChartProps = {
  data: CoursePopularityItem[];
};

// Chart height constants for responsive design (Requirements: 7.1, 7.2)
const MIN_CHART_HEIGHT_MOBILE = 200;
const MIN_CHART_HEIGHT_DESKTOP = 250;
const HEIGHT_PER_ITEM_MOBILE = 30;
const HEIGHT_PER_ITEM_DESKTOP = 35;

export function CoursePopularityChart({ data }: CoursePopularityChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();

  const chartData = data.map((item) => ({
    ...item,
    name: item.courseCode,
  }));

  // Calculate dynamic height based on number of items and viewport
  const chartHeight = isMobile
    ? Math.max(MIN_CHART_HEIGHT_MOBILE, data.length * HEIGHT_PER_ITEM_MOBILE)
    : Math.max(MIN_CHART_HEIGHT_DESKTOP, data.length * HEIGHT_PER_ITEM_DESKTOP);

  return (
    <div className="nb-card">
      <h3 className="font-display font-semibold text-lg mb-4">
        Môn học phổ biến
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 60, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#4a4a4a' : '#ddd'}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            type="number"
            tick={{ fill: isDark ? '#e5e5e5' : '#111', fontSize: 12 }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: isDark ? '#e5e5e5' : '#111', fontSize: 12 }}
            width={55}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CoursePopularityItem & { name: string };
                return (
                  <div
                    className={`px-3 py-2 border-2 rounded shadow-neo-sm ${
                      isDark
                        ? 'bg-nb-dark-section border-nb-dark-border text-nb-dark-text'
                        : 'bg-white border-black'
                    }`}
                  >
                    <p className="font-semibold">{item.courseName}</p>
                    <p className="text-sm opacity-70">Mã môn: {item.courseCode}</p>
                    <p>Số đăng ký: {item.enrollmentCount}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="enrollmentCount"
            fill={isDark ? '#8AC186' : '#8AC186'}
            stroke={isDark ? '#393947' : '#111'}
            strokeWidth={2}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
