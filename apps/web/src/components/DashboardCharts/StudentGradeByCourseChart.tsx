import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { StudentGradeByCourseItem } from '../../lib/me';
import { useTheme } from '../../lib/themeHooks';
import { useIsMobile } from '../../lib/useIsMobile';

type StudentGradeByCourseChartProps = {
  data: StudentGradeByCourseItem[];
};

const MIN_CHART_HEIGHT_MOBILE = 200;
const MIN_CHART_HEIGHT_DESKTOP = 250;
const HEIGHT_PER_ITEM_MOBILE = 30;
const HEIGHT_PER_ITEM_DESKTOP = 35;

export function StudentGradeByCourseChart({ data }: StudentGradeByCourseChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();

  const chartData = data.map((item) => ({
    ...item,
    name: item.courseCode,
  }));

  const chartHeight = isMobile
    ? Math.max(MIN_CHART_HEIGHT_MOBILE, data.length * HEIGHT_PER_ITEM_MOBILE)
    : Math.max(MIN_CHART_HEIGHT_DESKTOP, data.length * HEIGHT_PER_ITEM_DESKTOP);

  if (data.length === 0) {
    return (
      <div className="edu-card">
        <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">Điểm theo môn học</h3>
        <div className="flex items-center justify-center h-[250px] text-edu-ink-light dark:text-edu-dark-text-dim">
          Chưa có dữ liệu điểm
        </div>
      </div>
    );
  }

  return (
    <div className="edu-card">
      <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">Điểm theo môn học</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 60, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#334155' : '#E2E8F0'}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            type="number"
            domain={[0, 10]}
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12 }}
            allowDecimals={true}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12 }}
            width={55}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as StudentGradeByCourseItem & { name: string };
                return (
                  <div
                    className={`px-3 py-2 rounded-lg shadow-elevated text-sm ${
                      isDark
                        ? 'bg-edu-dark-surface border border-edu-dark-border text-edu-dark-text'
                        : 'bg-white border border-edu-border text-edu-ink'
                    }`}
                  >
                    <p className="font-semibold">{item.courseName}</p>
                    <p className="text-sm opacity-70">Mã môn: {item.courseCode}</p>
                    <p className="text-sm opacity-70">Tín chỉ: {item.credits}</p>
                    <p>Điểm: {item.total.toFixed(2)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="total"
            fill={isDark ? '#60A5FA' : '#0D9488'}
            stroke="transparent"
            strokeWidth={0}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

