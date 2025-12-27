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
      <div className="edu-card">
        <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">Tín chỉ theo học kỳ</h3>
        <div className="flex items-center justify-center h-[250px] text-edu-ink-light dark:text-edu-dark-text-dim">
          Chưa có dữ liệu tín chỉ
        </div>
      </div>
    );
  }

  return (
    <div className="edu-card">
      <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">Tín chỉ theo học kỳ</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#334155' : '#E2E8F0'}
          />
          <XAxis
            dataKey="semester"
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as StudentCreditsBySemesterItem;
                return (
                  <div
                    className={`px-3 py-2 rounded-lg shadow-elevated text-sm ${
                      isDark
                        ? 'bg-edu-dark-surface border border-edu-dark-border text-edu-dark-text'
                        : 'bg-white border border-edu-border text-edu-ink'
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

