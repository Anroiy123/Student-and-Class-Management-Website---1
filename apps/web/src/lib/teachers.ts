import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api';

export type Teacher = {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string | null;
  specialization: string | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RETIRED';
  hireDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListTeachersResponse = Teacher[];

export async function listTeachers(): Promise<ListTeachersResponse> {
  const { data } = await apiClient.get<ListTeachersResponse>('/teachers');
  return data;
}

export function useTeachers() {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: listTeachers,
  });
}

