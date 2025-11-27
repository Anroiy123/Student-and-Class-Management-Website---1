import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { StudentCreditsBySemesterItem } from '../../lib/me';
import { useTheme } from '../../lib/themeHooks';
import { useIsMobile } from '../../lib/useIsMobile';

type StudentCreditsBySemesterChartProps = {
  data: StudentCreditsBySemesterItem[];
};

const CHART_HEIGHT_MOBILE = 200;
const CHART_HEIGHT_DESKTOP = 250;

export function StudentCreditsBySemesterChart({ data }: StudentCreditsBySemesterChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP;

  if (data.length === 0) {
    return (
      <div className="nb-card">
        <h3 className="font-display font-semibold text-lg mb-4">Tín chỉ theo học kỳ</h3>
        <div className="flex items-center justify-center h-[250px] text-gray-500">
          Chưa có dữ liệu tín chỉ
        </div>
      </div>
    );
  }

  return (
    <div className="nb-card">
      <h3 className="font-display font-semibold text-lg mb-4">Tín chỉ theo học kỳ</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#4a4a4a' : '#ddd'}
          />
          <XAxis
            dataKey="semester"
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
                const item = payload[0].payload as StudentCreditsBySemesterItem;
                return (
                  <div
                    className={`px-3 py-2 border-2 rounded shadow-neo-sm ${
                      isDark
                        ? 'bg-nb-dark-section border-nb-dark-border text-nb-dark-text'
                        : 'bg-white border-black'
                    }`}
                  >
                    <p className="font-semibold">{item.semester}</p>
                    <p>Tín chỉ: {item.credits}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="credits"
            fill={isDark ? '#8AC186' : '#8AC186'}
            stroke={isDark ? '#393947' : '#111'}
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

