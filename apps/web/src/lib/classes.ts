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

export type ClassListItem = {
  _id: string;
  code: string;
  name: string;
  size: number;
  homeroomTeacherId: TeacherInfo | null;
  createdAt: string;
  updatedAt: string;
};

export type ListClassesResponse = ClassListItem[];

export async function listClasses(): Promise<ListClassesResponse> {
  const { data } = await apiClient.get<ListClassesResponse>('/classes');
  return data;
}

export type UpsertClassPayload = {
  code: string;
  name: string;
  size?: number;
  homeroomTeacherId?: string;
};

export async function createClass(
  payload: UpsertClassPayload,
): Promise<ClassListItem> {
  const { data } = await apiClient.post<ClassListItem>('/classes', payload);
  return data;
}

export async function updateClass(
  id: string,
  payload: Partial<UpsertClassPayload>,
): Promise<ClassListItem> {
  const { data } = await apiClient.put<ClassListItem>(
    `/classes/${id}`,
    payload,
  );
  return data;
}

export async function deleteClass(id: string): Promise<void> {
  await apiClient.delete(`/classes/${id}`);
}

export function useClassesQuery() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => listClasses(),
    placeholderData: keepPreviousData,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<UpsertClassPayload>;
    }) => updateClass(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}
