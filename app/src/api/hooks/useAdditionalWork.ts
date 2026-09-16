import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { AdditionalWork, AdditionalWorkInput } from '../../types/api';

export function useAdditionalWork(workerId?: string) {
  return useQuery({
    queryKey: ['additional-work', workerId ?? 'all'],
    queryFn: () =>
      api.get<AdditionalWork[]>(workerId ? `/additional-work?worker_id=${workerId}` : '/additional-work'),
  });
}

export function useCreateAdditionalWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdditionalWorkInput) => api.post<AdditionalWork>('/additional-work', input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['additional-work'] });
      queryClient.invalidateQueries({ queryKey: ['workers', variables.worker_id, 'balance'] });
    },
  });
}
