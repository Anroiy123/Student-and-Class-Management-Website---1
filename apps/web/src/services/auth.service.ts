import { api } from '../lib/axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  // Đăng nhập
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Đăng ký
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Lấy thông tin user hiện tại
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Lưu token vào localStorage
  setToken: (token: string) => {
    localStorage.setItem('accessToken', token);
  },

  // Lấy token từ localStorage
  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  // Xóa token khỏi localStorage
  removeToken: () => {
    localStorage.removeItem('accessToken');
  },
};
