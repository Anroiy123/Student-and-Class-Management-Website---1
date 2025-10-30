import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  studentService,
  type GetStudentsParams,
  type CreateStudentDto,
  type UpdateStudentDto,
} from '../services/student.service';

// Query key factory
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (params?: GetStudentsParams) => [...studentKeys.lists(), params] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
};

// Hook để lấy danh sách sinh viên
export const useStudents = (params?: GetStudentsParams) => {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentService.getStudents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook để lấy chi tiết sinh viên
export const useStudent = (id: string) => {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentService.getStudent(id),
    enabled: !!id,
  });
};

// Hook để tạo sinh viên mới
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentDto) => studentService.createStudent(data),
    onSuccess: () => {
      // Invalidate và refetch danh sách sinh viên
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
};

// Hook để cập nhật sinh viên
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentDto }) =>
      studentService.updateStudent(id, data),
    onSuccess: (_, variables) => {
      // Invalidate danh sách và detail
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) });
    },
  });
};

// Hook để xóa sinh viên
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentService.deleteStudent(id),
    onSuccess: () => {
      // Invalidate danh sách sinh viên
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
};
