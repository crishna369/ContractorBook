import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { Worker, WorkerCreateInput } from '../../types/api';

export function useWorkers() {
  return useQuery({
    queryKey: ['workers'],
    queryFn: () => api.get<Worker[]>('/workers'),
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkerCreateInput) => api.post<Worker>('/workers', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}

export function useDeleteWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workerId: string) => api.delete<void>(`/workers/${workerId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}
