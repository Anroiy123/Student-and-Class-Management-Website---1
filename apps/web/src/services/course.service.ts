import { api } from "../lib/axios";

export interface Course {
  _id: string;
  code: string;
  name: string;
  credits: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseDto {
  code: string;
  name: string;
  credits: number;
}

export interface UpdateCourseDto {
  code?: string;
  name?: string;
  credits?: number;
}

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    const response = await api.get("/courses");
    return response.data;
  },

  getCourseById: async (id: string): Promise<Course> => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  createCourse: async (data: CreateCourseDto): Promise<Course> => {
    const response = await api.post("/courses", data);
    return response.data;
  },

  updateCourse: async (id: string, data: UpdateCourseDto): Promise<Course> => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await api.delete(`/courses/${id}`);
  },
};
