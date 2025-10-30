import { api } from '../lib/axios';

export interface Class {
  _id: string;
  code: string;
  name: string;
  size?: number;
  homeroomTeacher?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassDto {
  code: string;
  name: string;
  size?: number;
  homeroomTeacher?: string;
}

export interface UpdateClassDto {
  code?: string;
  name?: string;
  size?: number;
  homeroomTeacher?: string;
}

// Get all classes
export const getClasses = async (): Promise<Class[]> => {
  const response = await api.get('/classes');
  return response.data;
};

// Get class by id
export const getClassById = async (id: string): Promise<Class> => {
  const response = await api.get(`/classes/${id}`);
  return response.data;
};

// Create new class
export const createClass = async (data: CreateClassDto): Promise<Class> => {
  const response = await api.post('/classes', data);
  return response.data;
};

// Update class
export const updateClass = async (id: string, data: UpdateClassDto): Promise<Class> => {
  const response = await api.put(`/classes/${id}`, data);
  return response.data;
};

// Delete class
export const deleteClass = async (id: string): Promise<void> => {
  await api.delete(`/classes/${id}`);
};
