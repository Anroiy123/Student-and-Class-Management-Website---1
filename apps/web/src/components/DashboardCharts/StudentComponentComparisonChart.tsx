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
      <div className="nb-card">
        <h3 className="font-display font-semibold text-lg mb-4">So sánh điểm thành phần</h3>
        <div className="flex items-center justify-center h-[250px] text-gray-500">
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
    <div className="nb-card">
      <h3 className="font-display font-semibold text-lg mb-4">So sánh điểm thành phần</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#4a4a4a' : '#ddd'}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: isDark ? '#e5e5e5' : '#111', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: isDark ? '#e5e5e5' : '#111', fontSize: 12 }}
            allowDecimals={true}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div
                    className={`px-3 py-2 border-2 rounded shadow-neo-sm ${
                      isDark
                        ? 'bg-nb-dark-section border-nb-dark-border text-nb-dark-text'
                        : 'bg-white border-black'
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
              color: isDark ? '#e5e5e5' : '#111',
            }}
          />
          <Bar
            dataKey="Chuyên cần"
            fill={isDark ? '#8AC186' : '#8AC186'}
            stroke={isDark ? '#393947' : '#111'}
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="Giữa kỳ"
            fill={isDark ? '#9AD9FF' : '#9AD9FF'}
            stroke={isDark ? '#393947' : '#111'}
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="Cuối kỳ"
            fill={isDark ? '#D4AF37' : '#FFE76A'}
            stroke={isDark ? '#393947' : '#111'}
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

