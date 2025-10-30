import { api } from "../lib/axios";

export interface Grade {
  _id: string;
  enrollmentId: {
    _id: string;
    studentId: {
      _id: string;
      mssv: string;
      fullName: string;
    };
    courseId: {
      _id: string;
      code: string;
      name: string;
      credits: number;
    };
    classId?: {
      _id: string;
      code: string;
      name: string;
    } | null;
    semester: string;
  };
  attendance: number;
  midterm: number;
  final: number;
  total: number;
  computedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertGradeDto {
  attendance: number;
  midterm: number;
  final: number;
}

export const gradeService = {
  getAllGrades: async (filters?: {
    studentId?: string;
    courseId?: string;
    classId?: string;
  }): Promise<Grade[]> => {
    const params = new URLSearchParams();
    if (filters?.studentId) params.append("studentId", filters.studentId);
    if (filters?.courseId) params.append("courseId", filters.courseId);
    if (filters?.classId) params.append("classId", filters.classId);

    const response = await api.get(`/grades?${params.toString()}`);
    return response.data;
  },

  upsertGrade: async (enrollmentId: string, data: UpsertGradeDto): Promise<Grade> => {
    const response = await api.put(`/grades/${enrollmentId}`, data);
    return response.data;
  },
};
