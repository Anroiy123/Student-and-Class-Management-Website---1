/**
 * Students By Class Bar Chart Component
 * Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 7.4
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
import type { StudentsByClassItem } from '../../lib/dashboard';
import { useTheme } from '../../lib/themeHooks';
import { useIsMobile } from '../../lib/useIsMobile';

type StudentsByClassChartProps = {
  data: StudentsByClassItem[];
};

// Chart height constants for responsive design (Requirements: 7.1, 7.2)
const CHART_HEIGHT_MOBILE = 200;
const CHART_HEIGHT_DESKTOP = 250;

export function StudentsByClassChart({ data }: StudentsByClassChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP;

  const chartData = data.map((item) => ({
    ...item,
    name: item.classCode || item.className,
  }));

  return (
    <div className="edu-card">
      <h3 className="font-display font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">
        Sinh viên theo lớp
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#334155' : '#E2E8F0'}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as StudentsByClassItem & { name: string };
                return (
                  <div
                    className={`px-3 py-2 border rounded-lg shadow-card ${
                      isDark
                        ? 'bg-edu-dark-surface border-edu-dark-border text-edu-dark-text'
                        : 'bg-white border-edu-border'
                    }`}
                  >
                    <p className="font-semibold">{item.className}</p>
                    <p className="text-sm text-edu-ink-light dark:text-edu-dark-text-dim">Mã lớp: {item.classCode}</p>
                    <p>Số sinh viên: {item.studentCount}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="studentCount"
            fill={isDark ? '#60A5FA' : '#0D9488'}
            stroke="transparent"
            strokeWidth={0}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
