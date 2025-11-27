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
    <div className="nb-card">
      <h3 className="font-display font-semibold text-lg mb-4">
        Sinh viên theo lớp
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#4a4a4a' : '#ddd'}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: isDark ? '#e5e5e5' : '#111', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            tick={{ fill: isDark ? '#e5e5e5' : '#111', fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as StudentsByClassItem & { name: string };
                return (
                  <div
                    className={`px-3 py-2 border-2 rounded shadow-neo-sm ${
                      isDark
                        ? 'bg-nb-dark-section border-nb-dark-border text-nb-dark-text'
                        : 'bg-white border-black'
                    }`}
                  >
                    <p className="font-semibold">{item.className}</p>
                    <p className="text-sm opacity-70">Mã lớp: {item.classCode}</p>
                    <p>Số sinh viên: {item.studentCount}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="studentCount"
            fill={isDark ? '#9AD9FF' : '#9AD9FF'}
            stroke={isDark ? '#393947' : '#111'}
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
