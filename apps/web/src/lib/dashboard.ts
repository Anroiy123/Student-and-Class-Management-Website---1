import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from './api';

// Types cho Dashboard Stats
export type DashboardStats = {
  totalStudents: number;
  totalClasses: number;
  totalCourses: number;
};

// Types cho Recent Activities
export type ActivityType = 'enrollment' | 'grade_update' | 'new_student';

export type ActivityDetails = {
  studentName?: string;
  studentMssv?: string;
  courseName?: string;
  courseCode?: string;
  className?: string;
  classCode?: string;
  total?: number;
};

export type ActivityItem = {
  _id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  details: ActivityDetails;
};

export type RecentActivitiesResponse = {
  items: ActivityItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type RecentActivitiesParams = {
  page?: number;
  pageSize?: number;
};

// API functions
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
  return data;
}

export async function getRecentActivities(
  params: RecentActivitiesParams = {},
): Promise<RecentActivitiesResponse> {
  const { data } = await apiClient.get<RecentActivitiesResponse>(
    '/dashboard/recent-activities',
    { params },
  );
  return data;
}

// Types cho Dashboard Charts
export type GradeDistribution = {
  excellent: number; // ≥8
  good: number; // ≥6.5 and <8
  average: number; // ≥5 and <6.5
  poor: number; // <5
  total: number;
};

export type StudentsByClassItem = {
  classId: string;
  className: string;
  classCode: string;
  studentCount: number;
};

export type EnrollmentTrendItem = {
  month: string; // "2025-01", "2025-02", etc.
  monthLabel: string; // "Tháng 1", "Tháng 2", etc.
  count: number;
};

export type CoursePopularityItem = {
  courseId: string;
  courseCode: string;
  courseName: string;
  enrollmentCount: number;
};

export type DashboardChartsResponse = {
  gradeDistribution: GradeDistribution;
  studentsByClass: StudentsByClassItem[];
  enrollmentTrend: EnrollmentTrendItem[];
  coursePopularity: CoursePopularityItem[];
};

export type DashboardChartsParams = {
  limit?: number; // For top N results, default 10
};

// React Query hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    refetchInterval: 60000, // Auto-refresh mỗi 60 giây
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useRecentActivities(params: RecentActivitiesParams = {}) {
  return useQuery({
    queryKey: ['dashboard', 'recent-activities', params],
    queryFn: () => getRecentActivities(params),
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// API function for Dashboard Charts
export async function getDashboardCharts(
  params: DashboardChartsParams = {},
): Promise<DashboardChartsResponse> {
  const { data } = await apiClient.get<DashboardChartsResponse>(
    '/dashboard/charts',
    { params },
  );
  return data;
}

// React Query hook for Dashboard Charts
export function useDashboardCharts(params: DashboardChartsParams = {}) {
  return useQuery({
    queryKey: ['dashboard', 'charts', params],
    queryFn: () => getDashboardCharts(params),
    staleTime: 60000, // Cache for 60 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
