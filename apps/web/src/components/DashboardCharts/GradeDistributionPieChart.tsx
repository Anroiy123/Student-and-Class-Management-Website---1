/**
 * Grade Distribution Pie Chart Component
 * Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3, 7.4
 */
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { GradeDistribution } from '../../lib/dashboard';
import { useTheme } from '../../lib/themeHooks';
import { useIsMobile } from '../../lib/useIsMobile';

type GradeDistributionPieChartProps = {
  data: GradeDistribution;
};

type ChartDataItem = {
  name: string;
  value: number;
  color: string;
  darkColor: string;
};

const GRADE_LABELS: Record<string, string> = {
  excellent: 'Giỏi (≥8)',
  good: 'Khá (≥6.5)',
  average: 'Trung bình (≥5)',
  poor: 'Yếu (<5)',
};

const COLORS = {
  excellent: { light: '#059669', dark: '#34D399' }, // emerald
  good: { light: '#0284C7', dark: '#38BDF8' }, // sky
  average: { light: '#D97706', dark: '#FBBF24' }, // amber
  poor: { light: '#DC2626', dark: '#F87171' }, // red
};

// Chart height constants for responsive design (Requirements: 7.1, 7.2)
const CHART_HEIGHT_MOBILE = 200;
const CHART_HEIGHT_DESKTOP = 250;

export function GradeDistributionPieChart({ data }: GradeDistributionPieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP;

  const chartData: ChartDataItem[] = [
    {
      name: GRADE_LABELS.excellent,
      value: data.excellent,
      color: COLORS.excellent.light,
      darkColor: COLORS.excellent.dark,
    },
    {
      name: GRADE_LABELS.good,
      value: data.good,
      color: COLORS.good.light,
      darkColor: COLORS.good.dark,
    },
    {
      name: GRADE_LABELS.average,
      value: data.average,
      color: COLORS.average.light,
      darkColor: COLORS.average.dark,
    },
    {
      name: GRADE_LABELS.poor,
      value: data.poor,
      color: COLORS.poor.light,
      darkColor: COLORS.poor.dark,
    },
  ].filter((item) => item.value > 0);

  const total = data.total || chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="edu-card">
      <h3 className="font-semibold text-base text-edu-ink dark:text-edu-dark-text mb-4">Phân bố điểm số</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => {
              const label = (name ?? '').split(' ')[0];
              // Fix "Trung" to show as "Trung bình"
              const displayLabel = label === 'Trung' ? 'Trung bình' : label;
              return `${displayLabel} ${((percent ?? 0) * 100).toFixed(0)}%`;
            }}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={isDark ? entry.darkColor : entry.color}
                stroke="transparent"
                strokeWidth={0}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ChartDataItem;
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                return (
                  <div
                    className={`px-3 py-2 rounded-lg shadow-elevated text-sm ${
                      isDark
                        ? 'bg-edu-dark-surface border border-edu-dark-border text-edu-dark-text'
                        : 'bg-white border border-edu-border text-edu-ink'
                    }`}
                  >
                    <p className="font-semibold">{item.name}</p>
                    <p>Số lượng: {item.value}</p>
                    <p>Tỷ lệ: {percentage}%</p>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
