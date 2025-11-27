import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { apiClient } from './api';

export type TeacherInfo = {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
};

export type CourseListItem = {
  _id: string;
  code: string;
  name: string;
  credits: number;
  teacherId: TeacherInfo | null;
  createdAt: string;
  updatedAt: string;
};

export type ListCoursesResponse = CourseListItem[];

export async function listCourses(): Promise<ListCoursesResponse> {
  const { data } = await apiClient.get<ListCoursesResponse>('/courses');
  return data;
}

export type UpsertCoursePayload = {
  code: string;
  name: string;
  credits: number;
  teacherId?: string;
};

export async function createCourse(
  payload: UpsertCoursePayload,
): Promise<CourseListItem> {
  const { data } = await apiClient.post<CourseListItem>('/courses', payload);
  return data;
}

export async function updateCourse(
  id: string,
  payload: Partial<UpsertCoursePayload>,
): Promise<CourseListItem> {
  const { data } = await apiClient.put<CourseListItem>(
    `/courses/${id}`,
    payload,
  );
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  await apiClient.delete(`/courses/${id}`);
}

export function useCoursesQuery() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => listCourses(),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<UpsertCoursePayload>;
    }) => updateCourse(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
