import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { apiClient } from './api';

export type NotificationType = 'grade_added' | 'grade_updated' | 'info_updated' | 'general' | 'announcement';
export type RelatedType = 'grade' | 'student' | 'enrollment';
export type NotificationCategory = 'academic' | 'administrative' | 'event' | 'urgent' | 'general';

export type Notification = {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: RelatedType;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  category?: NotificationCategory;
  createdAt: string;
  updatedAt: string;
};

export type ListNotificationsResponse = {
  items: Notification[];
  total: number;
  page: number;
  pageSize: number;
};

export type ListNotificationsParams = {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
};

export type CreateNotificationPayload = {
  recipientType: 'user' | 'role' | 'all';
  recipientIds?: string[];
  recipientRole?: 'STUDENT' | 'TEACHER';
  title: string;
  message: string;
  category?: NotificationCategory;
};

// API Functions
export async function listNotifications(
  params: ListNotificationsParams,
): Promise<ListNotificationsResponse> {
  const { data } = await apiClient.get<ListNotificationsResponse>(
    '/notifications',
    {
      params: {
        ...params,
        unreadOnly: params.unreadOnly ? 'true' : 'false',
      },
    },
  );
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>(
    '/notifications/unread-count',
  );
  return data.count;
}

export async function createNotification(
  payload: CreateNotificationPayload,
): Promise<{ message: string; count: number }> {
  const { data } = await apiClient.post('/notifications', payload);
  return data;
}

export async function markAsRead(
  notificationId: string,
): Promise<Notification> {
  const { data } = await apiClient.put<Notification>(
    `/notifications/${notificationId}/read`,
  );
  return data;
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.put('/notifications/mark-all-read');
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}`);
}

// React Query Hooks
export function useNotificationsQuery(
  params: ListNotificationsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => listNotifications(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useUnreadCountQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    enabled: options?.enabled ?? true,
    refetchInterval: 30000, // Tự động refetch mỗi 30 giây
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      // Invalidate cache để cập nhật danh sách thông báo
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
