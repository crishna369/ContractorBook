import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { WorkerPayment, WorkerPaymentInput } from '../../types/api';

export function usePayments(workerId?: string) {
  return useQuery({
    queryKey: ['payments', workerId ?? 'all'],
    queryFn: () => api.get<WorkerPayment[]>(workerId ? `/payments?worker_id=${workerId}` : '/payments'),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkerPaymentInput) => api.post<WorkerPayment>('/payments', input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['workers', variables.worker_id, 'balance'] });
    },
  });
}
