import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { apiClient } from './api';

export type GradeListItem = {
  _id: string;
  enrollmentId: {
    _id: string;
    studentId: {
      _id: string;
      mssv: string;
      fullName: string;
      email: string;
    };
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
    };
    semester: string;
  };
  attendance: number;
  midterm: number;
  final: number;
  total: number;
  computedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ListGradesResponse = {
  items: GradeListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ListGradesParams = Partial<{
  page: number;
  pageSize: number;
  classId: string;
  courseId: string;
  studentId: string;
  semester: string;
}>;

export async function listGrades(
  params: ListGradesParams,
): Promise<ListGradesResponse> {
  const { data } = await apiClient.get<ListGradesResponse>('/grades', {
    params,
  });
  return data;
}

export type UpsertGradePayload = {
  attendance: number;
  midterm: number;
  final: number;
};

export async function upsertGrade(
  enrollmentId: string,
  payload: UpsertGradePayload,
): Promise<GradeListItem> {
  const { data } = await apiClient.put<GradeListItem>(
    `/grades/${enrollmentId}`,
    payload,
  );
  return data;
}

export function useGradesQuery(params: ListGradesParams) {
  return useQuery({
    queryKey: ['grades', params],
    queryFn: () => listGrades(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpsertGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      payload,
    }: {
      enrollmentId: string;
      payload: UpsertGradePayload;
    }) => upsertGrade(enrollmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] });
    },
  });
}

export function computeGradeClassification(total: number): string {
  if (total >= 8) return 'Giỏi';
  if (total >= 6.5) return 'Khá';
  if (total >= 5) return 'Trung bình';
  return 'Yếu';
}

export function computeSemesterAverage(grades: GradeListItem[]): number {
  if (grades.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalCredits = 0;

  grades.forEach((grade) => {
    const credits = grade.enrollmentId.courseId.credits;
    totalWeightedScore += grade.total * credits;
    totalCredits += credits;
  });

  return totalCredits > 0
    ? Number((totalWeightedScore / totalCredits).toFixed(2))
    : 0;
}

