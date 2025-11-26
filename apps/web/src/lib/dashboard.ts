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
