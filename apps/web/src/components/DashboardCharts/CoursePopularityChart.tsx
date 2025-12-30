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
import { useBreakpoint } from '../../lib/responsive';
import { getDynamicChartHeight } from './ChartConfig';

type CoursePopularityChartProps = {
  data: CoursePopularityItem[];
};

export function CoursePopularityChart({ data }: CoursePopularityChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { breakpoint, isMobile } = useBreakpoint();

  const chartData = data.map((item) => ({
    ...item,
    name: item.courseCode,
  }));

  // Calculate dynamic height based on number of items and viewport
  const chartHeight = getDynamicChartHeight(breakpoint, data.length);

  // Responsive font size
  const fontSize = isMobile ? 10 : 12;

  return (
    <div className="edu-card">
      <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">
        Môn học phổ biến
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 10,
            right: 10,
            left: isMobile ? 50 : 60,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#334155' : '#E2E8F0'}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            type="number"
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize }}
            allowDecimals={false}
            axisLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }}
            tickLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize }}
            width={isMobile ? 45 : 55}
            axisLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }}
            tickLine={{ stroke: isDark ? '#334155' : '#E2E8F0' }}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CoursePopularityItem & {
                  name: string;
                };
                return (
                  <div
                    className={`px-3 py-2 rounded-lg shadow-elevated text-sm ${
                      isDark
                        ? 'bg-edu-dark-surface border border-edu-dark-border text-edu-dark-text'
                        : 'bg-white border border-edu-border text-edu-ink'
                    }`}
                  >
                    <p className="font-semibold">{item.courseName}</p>
                    <p className="text-xs opacity-70">Mã môn: {item.courseCode}</p>
                    <p className="font-medium">Số đăng ký: {item.enrollmentCount}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="enrollmentCount"
            fill={isDark ? '#0D9488' : '#0D9488'}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
