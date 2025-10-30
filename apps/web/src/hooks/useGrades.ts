import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gradeService, type UpsertGradeDto } from "../services/grade.service";

export const useGrades = (filters?: {
  studentId?: string;
  courseId?: string;
  classId?: string;
}) => {
  return useQuery({
    queryKey: ["grades", filters],
    queryFn: () => gradeService.getAllGrades(filters),
  });
};

export const useUpsertGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: UpsertGradeDto }) =>
      gradeService.upsertGrade(enrollmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
};
