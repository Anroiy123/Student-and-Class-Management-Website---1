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
      <div className="edu-card">
        <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">
          Xu hướng GPA theo học kỳ
        </h3>
        <div className="flex items-center justify-center h-[250px] text-edu-ink-light dark:text-edu-dark-text-dim">
          Chưa có dữ liệu GPA
        </div>
      </div>
    );
  }

  return (
    <div className="edu-card">
      <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">
        Xu hướng GPA theo học kỳ
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#334155' : '#E2E8F0'}
          />
          <XAxis
            dataKey="semester"
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 4]}
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12 }}
            allowDecimals={true}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as StudentGPABySemesterItem;
                return (
                  <div
                    className={`px-3 py-2 rounded-lg shadow-elevated text-sm ${
                      isDark
                        ? 'bg-edu-dark-surface border border-edu-dark-border text-edu-dark-text'
                        : 'bg-white border border-edu-border text-edu-ink'
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
            stroke={isDark ? '#F59E0B' : '#0D9488'}
            strokeWidth={3}
            dot={{
              fill: isDark ? '#F59E0B' : '#0D9488',
              stroke: "transparent",
              strokeWidth: 0,
              r: 4,
            }}
            activeDot={{
              fill: isDark ? '#FBBF24' : '#14B8A6',
              stroke: "transparent",
              strokeWidth: 0,
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
