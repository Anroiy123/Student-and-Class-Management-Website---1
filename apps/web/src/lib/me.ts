import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from './api';

// ============ Types ============

export interface MyProfile {
  _id: string;
  mssv: string;
  fullName: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  classId: {
    _id: string;
    code: string;
    name: string;
  } | null;
}

export interface MyGradeItem {
  _id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  semester: string;
  attendance: number | null;
  midterm: number | null;
  final: number | null;
  total: number | null;
  classification: string;
}

export interface MyGradesResponse {
  items: MyGradeItem[];
  total: number;
  page: number;
  pageSize: number;
  gpa: number | null;
  totalCredits: number;
}

export interface MyEnrollmentItem {
  _id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  className: string | null;
  classCode: string | null;
  semester: string;
}

export interface MyEnrollmentsResponse {
  items: MyEnrollmentItem[];
  total: number;
  page: number;
  pageSize: number;
}


export interface MyDashboard {
  profile: {
    fullName: string;
    mssv: string;
    className: string | null;
  };
  stats: {
    totalEnrollments: number;
    totalCredits: number;
    gpa: number | null;
  };
  recentGrades: Array<{
    courseCode: string;
    courseName: string;
    credits: number;
    total: number | null;
    classification: string;
  }>;
}

export interface MyGradesParams {
  semester?: string;
  page?: number;
  pageSize?: number;
}

export interface MyEnrollmentsParams {
  semester?: string;
  page?: number;
  pageSize?: number;
}

// ============ API Functions ============

export async function getMyProfile(): Promise<MyProfile> {
  const { data } = await apiClient.get<MyProfile>('/me/profile');
  return data;
}

export async function getMyGrades(
  params: MyGradesParams = {}
): Promise<MyGradesResponse> {
  const { data } = await apiClient.get<MyGradesResponse>('/me/grades', {
    params,
  });
  return data;
}

export async function getMyEnrollments(
  params: MyEnrollmentsParams = {}
): Promise<MyEnrollmentsResponse> {
  const { data } = await apiClient.get<MyEnrollmentsResponse>(
    '/me/enrollments',
    { params }
  );
  return data;
}

export async function getMyDashboard(): Promise<MyDashboard> {
  const { data } = await apiClient.get<MyDashboard>('/me/dashboard');
  return data;
}

export async function getMySemesters(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/me/semesters');
  return data;
}

export async function exportMyGradesPdf(): Promise<Blob> {
  const { data } = await apiClient.get('/me/grades/export', {
    responseType: 'blob',
  });
  return data;
}

// ============ React Query Hooks ============

export function useMyProfile() {
  return useQuery({
    queryKey: ['me', 'profile'],
    queryFn: getMyProfile,
    retry: 1,
  });
}

export function useMyGrades(params: MyGradesParams = {}) {
  return useQuery({
    queryKey: ['me', 'grades', params],
    queryFn: () => getMyGrades(params),
    placeholderData: keepPreviousData,
  });
}

export function useMyEnrollments(params: MyEnrollmentsParams = {}) {
  return useQuery({
    queryKey: ['me', 'enrollments', params],
    queryFn: () => getMyEnrollments(params),
    placeholderData: keepPreviousData,
  });
}

export function useMyDashboard() {
  return useQuery({
    queryKey: ['me', 'dashboard'],
    queryFn: getMyDashboard,
  });
}

export function useMySemesters() {
  return useQuery({
    queryKey: ['me', 'semesters'],
    queryFn: getMySemesters,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============ Utility Functions ============

export function downloadPdf(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
