import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { apiClient } from './api';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'LOCKED';
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface UserListItem {
  _id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  studentId: { _id: string; mssv: string; fullName: string; email: string } | null;
  teacherId: { _id: string; employeeId: string; fullName: string; email: string } | null;
  approvedBy: { _id: string; email: string } | null;
  approvedAt: string | null;
  lockedAt: string | null;
  lockedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersResponse {
  items: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListUsersParams {
  status?: UserStatus;
  role?: UserRole;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface UnlinkedStudent {
  _id: string;
  mssv: string;
  fullName: string;
  email: string;
}

export interface UnlinkedTeacher {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
}

async function listUsers(params: ListUsersParams): Promise<ListUsersResponse> {
  const { data } = await apiClient.get<ListUsersResponse>('/users', { params });
  return data;
}

async function getUnlinkedRecords(role: 'STUDENT' | 'TEACHER') {
  const { data } = await apiClient.get('/users/unlinked', { params: { role } });
  return data;
}

async function approveUser(id: string, body: { studentId?: string; teacherId?: string }) {
  const { data } = await apiClient.put(`/users/${id}/approve`, body);
  return data;
}

async function lockUser(id: string, reason: string) {
  const { data } = await apiClient.put(`/users/${id}/lock`, { reason });
  return data;
}

async function unlockUser(id: string) {
  const { data } = await apiClient.put(`/users/${id}/unlock`);
  return data;
}

async function linkAccount(id: string, body: { studentId?: string; teacherId?: string }) {
  const { data } = await apiClient.put(`/users/${id}/link`, body);
  return data;
}

async function deleteUser(id: string) {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
}

export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => listUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUnlinkedStudents() {
  return useQuery({
    queryKey: ['unlinked-students'],
    queryFn: () => getUnlinkedRecords('STUDENT') as Promise<UnlinkedStudent[]>,
  });
}

export function useUnlinkedTeachers() {
  return useQuery({
    queryKey: ['unlinked-teachers'],
    queryFn: () => getUnlinkedRecords('TEACHER') as Promise<UnlinkedTeacher[]>,
  });
}

export function useApproveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { studentId?: string; teacherId?: string } }) =>
      approveUser(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['unlinked-students'] });
      qc.invalidateQueries({ queryKey: ['unlinked-teachers'] });
    },
  });
}

export function useLockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => lockUser(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUnlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unlockUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useLinkAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { studentId?: string; teacherId?: string } }) =>
      linkAccount(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['unlinked-students'] });
      qc.invalidateQueries({ queryKey: ['unlinked-teachers'] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

