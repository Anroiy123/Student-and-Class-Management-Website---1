import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as classService from '../services/class.service';
import type { CreateClassDto, UpdateClassDto } from '../services/class.service';

// Query key
export const CLASS_QUERY_KEY = 'classes';

// Get all classes
export const useClasses = () => {
  return useQuery({
    queryKey: [CLASS_QUERY_KEY],
    queryFn: classService.getClasses,
  });
};

// Get class by id
export const useClass = (id: string) => {
  return useQuery({
    queryKey: [CLASS_QUERY_KEY, id],
    queryFn: () => classService.getClassById(id),
    enabled: !!id,
  });
};

// Create class mutation
export const useCreateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateClassDto) => classService.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASS_QUERY_KEY] });
    },
  });
};

// Update class mutation
export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassDto }) => 
      classService.updateClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASS_QUERY_KEY] });
    },
  });
};

// Delete class mutation
export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => classService.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASS_QUERY_KEY] });
    },
  });
};
