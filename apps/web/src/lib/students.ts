import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { apiClient } from './api';

export type StudentListItem = {
  _id: string;
  mssv: string;
  fullName: string;
  dob: string; // ISO string
  email: string;
  phone: string;
  address: string;
  classId: null | { _id: string; code: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type ListStudentsResponse = {
  items: StudentListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ListStudentsParams = Partial<{
  page: number;
  pageSize: number;
  q: string;
  classId: string;
  mssv: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dobFrom: string; // YYYY-MM-DD or ISO
  dobTo: string; // YYYY-MM-DD or ISO
}>;

export async function listStudents(
  params: ListStudentsParams,
): Promise<ListStudentsResponse> {
  const { data } = await apiClient.get<ListStudentsResponse>('/students', {
    params,
  });
  return data;
}

export type UpsertStudentPayload = {
  mssv: string;
  fullName: string;
  dob: string; // ISO or YYYY-MM-DD
  email: string;
  phone: string;
  address: string;
  classId?: string | null;
};

export async function createStudent(
  payload: UpsertStudentPayload,
): Promise<StudentListItem> {
  const { data } = await apiClient.post<StudentListItem>('/students', payload);
  return data;
}

export async function updateStudent(
  id: string,
  payload: Partial<UpsertStudentPayload>,
): Promise<StudentListItem> {
  const { data } = await apiClient.put<StudentListItem>(
    `/students/${id}`,
    payload,
  );
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  await apiClient.delete(`/students/${id}`);
}

export function useStudentsQuery(params: ListStudentsParams) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => listStudents(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<UpsertStudentPayload>;
    }) => updateStudent(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
