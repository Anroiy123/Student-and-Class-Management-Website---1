import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { StudentGPABySemesterItem } from '../../lib/me';
import { useTheme } from '../../lib/themeHooks';
import { useIsMobile } from '../../lib/useIsMobile';

type StudentGPATrendChartProps = {
  data: StudentGPABySemesterItem[];
};

const CHART_HEIGHT_MOBILE = 200;
const CHART_HEIGHT_DESKTOP = 250;

export function StudentGPATrendChart({ data }: StudentGPATrendChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP;

  if (data.length === 0) {
    return (
      <div className="nb-card">
        <h3 className="font-display font-semibold text-lg mb-4">
          Xu hướng GPA theo học kỳ
        </h3>
        <div className="flex items-center justify-center h-[250px] text-gray-500">
          Chưa có dữ liệu GPA
        </div>
      </div>
    );
  }

  return (
    <div className="nb-card">
      <h3 className="font-display font-semibold text-lg mb-4">
        Xu hướng GPA theo học kỳ
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#4a4a4a' : '#ddd'}
          />
          <XAxis
            dataKey="semester"
            tick={{ fill: isDark ? '#e5e5e5' : '#111', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 4]}
            tick={{ fill: isDark ? '#e5e5e5' : '#111', fontSize: 12 }}
            allowDecimals={true}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as StudentGPABySemesterItem;
                return (
                  <div
                    className={`px-3 py-2 border-2 rounded shadow-neo-sm ${
                      isDark
                        ? 'bg-nb-dark-section border-nb-dark-border text-nb-dark-text'
                        : 'bg-white border-black'
                    }`}
                  >
                    <p className="font-semibold">{item.semester}</p>
                    <p>
                      GPA (Thang 10):{' '}
                      {item.gpa !== null ? item.gpa.toFixed(2) : 'N/A'}
                    </p>
                    <p>
                      GPA (Thang 4):{' '}
                      {item.gpa4 !== null && item.gpa4 !== undefined
                        ? item.gpa4.toFixed(2)
                        : 'N/A'}
                    </p>
                    <p className="text-sm opacity-70">
                      Tín chỉ: {item.totalCredits}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="gpa4"
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
