import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { GradeStatistics } from '../../lib/grades';
import { useTheme } from '../../lib/themeHooks';

interface GradeDistributionChartProps {
  statistics: GradeStatistics;
  hasSearch?: boolean; // true when searching for specific student
}

const COLORS = {
  excellent: '#22c55e', // green-500
  good: '#3b82f6', // blue-500
  average: '#eab308', // yellow-500
  poor: '#ef4444', // red-500
};

const getGradeColor = (total: number) => {
  if (total >= 8) return COLORS.excellent;
  if (total >= 6.5) return COLORS.good;
  if (total >= 5) return COLORS.average;
  return COLORS.poor;
};

export function GradeDistributionChart({
  statistics,
  hasSearch = false,
}: GradeDistributionChartProps) {
  const { distribution, byCourse } = statistics;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Only show course-by-course chart when searching for specific student
  if (hasSearch && byCourse && byCourse.length > 0) {
    const courseData = byCourse.map((course) => ({
      name: course.courseCode,
      fullName: course.courseName,
      total: course.total,
      color: getGradeColor(course.total),
    }));

    // Calculate dynamic height based on number of courses
    const chartHeight = Math.max(300, courseData.length * 40);

    return (
      <div className="nb-card">
        <h4 className="font-bold mb-4">Biểu đồ điểm số theo môn học</h4>
        <div style={{ height: `${chartHeight}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courseData} layout="vertical" margin={{ left: 80, right: 30, top: 10, bottom: 10 }}>
              <XAxis type="number" domain={[0, 10]} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100} 
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <Tooltip
                cursor={false}
                formatter={(value: number) => [value.toFixed(2), 'Điểm TB']}
                labelFormatter={(label) => {
                  const course = courseData.find((c) => c.name === label);
                  return course?.fullName || label;
                }}
                contentStyle={{
                  border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  backgroundColor: isDark ? '#1A2332' : 'white',
                  color: isDark ? '#F1F5F9' : '#0F172A',
                }}
                labelStyle={{
                  color: isDark ? '#F1F5F9' : '#0F172A',
                  fontWeight: 600,
                }}
                itemStyle={{
                  color: isDark ? '#F1F5F9' : '#0F172A',
                }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {courseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded border border-black"
              style={{ backgroundColor: COLORS.excellent }}
            />
            <span>Giỏi (≥8)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded border border-black"
              style={{ backgroundColor: COLORS.good }}
            />
            <span>Khá (≥6.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded border border-black"
              style={{ backgroundColor: COLORS.average }}
            />
            <span>TB (≥5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded border border-black"
              style={{ backgroundColor: COLORS.poor }}
            />
            <span>Yếu (&lt;5)</span>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show distribution by classification
  const data = [
    { name: 'Giỏi (≥8)', count: distribution.excellent, color: COLORS.excellent },
    { name: 'Khá (≥6.5)', count: distribution.good, color: COLORS.good },
    { name: 'TB (≥5)', count: distribution.average, color: COLORS.average },
    { name: 'Yếu (<5)', count: distribution.poor, color: COLORS.poor },
  ];

  const total = distribution.excellent + distribution.good + distribution.average + distribution.poor;

  return (
    <div className="nb-card">
      <h4 className="font-bold mb-4">Phân bố xếp loại điểm</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
            <Tooltip
              cursor={false}
              formatter={(value: number) => [
                `${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                'Số lượng',
              ]}
              contentStyle={{
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                borderRadius: '8px',
                backgroundColor: isDark ? '#1A2332' : 'white',
                color: isDark ? '#F1F5F9' : '#0F172A',
              }}
              labelStyle={{
                color: isDark ? '#F1F5F9' : '#0F172A',
                fontWeight: 600,
              }}
              itemStyle={{
                color: isDark ? '#F1F5F9' : '#0F172A',
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded border border-black"
              style={{ backgroundColor: item.color }}
            />
            <span>
              {item.name}: <strong>{item.count}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="nb-card h-80 bg-gray-200 dark:bg-nb-dark-section animate-pulse" />
  );
}
