import { api } from "../lib/axios";

export interface Enrollment {
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
    teacherEmail?: string;
    teacherName?: string;
  };
  classId?: {
    _id: string;
    code: string;
    name: string;
  } | null;
  semester: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnrollmentDto {
  studentId: string;
  courseId: string;
  classId?: string | null;
  semester: string;
}

export const enrollmentService = {
  getAllEnrollments: async (filters?: {
    studentId?: string;
    courseId?: string;
    classId?: string;
    semester?: string;
  }): Promise<Enrollment[]> => {
    const params = new URLSearchParams();
    if (filters?.studentId) params.append("studentId", filters.studentId);
    if (filters?.courseId) params.append("courseId", filters.courseId);
    if (filters?.classId) params.append("classId", filters.classId);
    if (filters?.semester) params.append("semester", filters.semester);

    const response = await api.get(`/enrollments?${params.toString()}`);
    return response.data;
  },

  createEnrollment: async (data: CreateEnrollmentDto): Promise<Enrollment> => {
    const response = await api.post("/enrollments", data);
    return response.data;
  },

  deleteEnrollment: async (id: string): Promise<void> => {
    await api.delete(`/enrollments/${id}`);
  },
};
