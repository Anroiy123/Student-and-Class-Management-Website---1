import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { StudentComponentComparison } from '../../lib/me';
import { useTheme } from '../../lib/themeHooks';
import { useIsMobile } from '../../lib/useIsMobile';

type StudentComponentComparisonChartProps = {
  data: StudentComponentComparison;
};

const CHART_HEIGHT_MOBILE = 200;
const CHART_HEIGHT_DESKTOP = 250;

export function StudentComponentComparisonChart({ data }: StudentComponentComparisonChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP;

  if (data.count === 0) {
    return (
      <div className="edu-card">
        <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">So sánh điểm thành phần</h3>
        <div className="flex items-center justify-center h-[250px] text-edu-ink-light dark:text-edu-dark-text-dim">
          Chưa có dữ liệu điểm
        </div>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Điểm trung bình',
      'Chuyên cần': data.attendance,
      'Giữa kỳ': data.midterm,
      'Cuối kỳ': data.final,
    },
  ];

  return (
    <div className="edu-card">
      <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">So sánh điểm thành phần</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#334155' : '#E2E8F0'}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12 }}
            allowDecimals={true}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div
                    className={`px-3 py-2 rounded-lg shadow-elevated text-sm ${
                      isDark
                        ? 'bg-edu-dark-surface border border-edu-dark-border text-edu-dark-text'
                        : 'bg-white border border-edu-border text-edu-ink'
                    }`}
                  >
                    <p className="font-semibold mb-1">Điểm trung bình</p>
                    {payload.map((entry, index) => (
                      <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : 'N/A'}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{
              color: isDark ? '#94A3B8' : '#475569',
              fontSize: '12px',
            }}
          />
          <Bar
            dataKey="Chuyên cần"
            fill={isDark ? '#34D399' : '#059669'}
            stroke="transparent"
            strokeWidth={0}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="Giữa kỳ"
            fill={isDark ? '#38BDF8' : '#0284C7'}
            stroke="transparent"
            strokeWidth={0}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="Cuối kỳ"
            fill={isDark ? '#FBBF24' : '#D97706'}
            stroke="transparent"
            strokeWidth={0}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

