import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from './api';

export type EnrollmentListItem = {
  _id: string;
  studentId: {
    _id: string;
    mssv: string;
    fullName: string;
  } | null;
  classId: {
    _id: string;
    code: string;
    name: string;
  } | null;
  courseId: {
    _id: string;
    code: string;
    name: string;
    credits: number;
  } | null;
  semester: string;
  createdAt: string;
  updatedAt: string;
};

export type ListEnrollmentsParams = Partial<{
  studentId: string;
  classId: string;
  courseId: string;
  semester: string;
}>;

export type ListEnrollmentsResponse = EnrollmentListItem[];

export async function listEnrollments(
  params?: ListEnrollmentsParams,
): Promise<ListEnrollmentsResponse> {
  const { data } = await apiClient.get<ListEnrollmentsResponse>(
    '/enrollments',
    {
      params,
    },
  );
  return data;
}

export function useEnrollmentsQuery(params?: ListEnrollmentsParams) {
  return useQuery({
    queryKey: ['enrollments', params],
    queryFn: () => listEnrollments(params),
    placeholderData: keepPreviousData,
  });
}
