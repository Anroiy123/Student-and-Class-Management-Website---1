import { useState, useEffect, type ReactNode } from 'react';
import { apiClient } from './api';
import { AuthContext, type User, type UserRole } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{
        accessToken: string;
        user: User;
      }>('/auth/login', { email, password });

      const { accessToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: unknown) {
      const message =
        error instanceof Error && 'response' in error && error.response
          ? (error.response as { data?: { message?: string } }).data?.message
          : undefined;
      throw new Error(message || 'Đăng nhập thất bại');
    }
  };

  const register = async (
    email: string,
    password: string,
    role: UserRole = 'STUDENT',
  ) => {
    try {
      await apiClient.post('/auth/register', {
        email,
        password,
        role,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error && 'response' in error && error.response
          ? (error.response as { data?: { message?: string } }).data?.message
          : undefined;
      throw new Error(message || 'Đăng ký thất bại');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth/sign-in';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
