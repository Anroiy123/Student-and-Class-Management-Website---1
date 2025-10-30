import { api } from '../lib/axios';

export interface Student {
  _id: string;
  mssv: string;  // Backend uses 'mssv', not 'studentId'
  fullName: string;
  dob: string;   // Backend uses 'dob', not 'dateOfBirth'
  email: string;
  phone: string;
  address: string;
  classId?: string | { _id: string; code: string; name: string };  // Can be populated with code and name
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentDto {
  mssv: string;
  fullName: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  classId?: string;
}

export interface UpdateStudentDto {
  mssv?: string;
  fullName?: string;
  dob?: string;
  email?: string;
  phone?: string;
  address?: string;
  classId?: string;
}

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
}

export interface GetStudentsResponse {
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
}

export const studentService = {
  // Lấy danh sách sinh viên
  getStudents: async (params?: GetStudentsParams): Promise<GetStudentsResponse> => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  // Lấy chi tiết sinh viên
  getStudent: async (id: string): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Tạo sinh viên mới
  createStudent: async (data: CreateStudentDto): Promise<Student> => {
    const response = await api.post('/students', data);
    return response.data;
  },

  // Cập nhật sinh viên
  updateStudent: async (id: string, data: UpdateStudentDto): Promise<Student> => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  // Xóa sinh viên
  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  // Tìm kiếm sinh viên
  searchStudents: async (query: string): Promise<Student[]> => {
    const response = await api.get('/students/search', {
      params: { q: query },
    });
    return response.data;
  },
};
