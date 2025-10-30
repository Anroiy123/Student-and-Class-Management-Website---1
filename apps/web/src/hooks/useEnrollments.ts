import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enrollmentService, type CreateEnrollmentDto } from "../services/enrollment.service";

export const useEnrollments = (filters?: {
  studentId?: string;
  courseId?: string;
  classId?: string;
  semester?: string;
}) => {
  return useQuery({
    queryKey: ["enrollments", filters],
    queryFn: () => enrollmentService.getAllEnrollments(filters),
  });
};

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEnrollmentDto) => enrollmentService.createEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
};

export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enrollmentService.deleteEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
};
