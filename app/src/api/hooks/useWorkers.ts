import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { Worker, WorkerBalance, WorkerCreateInput, WorkerReport, WorkerUpdateInput } from '../../types/api';

export function useWorkers() {
  return useQuery({
    queryKey: ['workers'],
    queryFn: () => api.get<Worker[]>('/workers'),
  });
}

export function useWorker(workerId: string) {
  return useQuery({
    queryKey: ['workers', workerId],
    queryFn: () => api.get<Worker>(`/workers/${workerId}`),
  });
}

export function useWorkerBalance(workerId: string) {
  return useQuery({
    queryKey: ['workers', workerId, 'balance'],
    queryFn: () => api.get<WorkerBalance>(`/workers/${workerId}/balance`),
  });
}

export function useWorkerReport(workerId: string, dateFrom?: string | null, dateTo?: string | null) {
  const params = new URLSearchParams();
  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);
  const qs = params.toString();
  return useQuery({
    queryKey: ['workers', workerId, 'report', dateFrom ?? null, dateTo ?? null],
    queryFn: () => api.get<WorkerReport>(`/workers/${workerId}/report${qs ? `?${qs}` : ''}`),
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkerCreateInput) => api.post<Worker>('/workers', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}

export function useUpdateWorker(workerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkerUpdateInput) => api.patch<Worker>(`/workers/${workerId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['workers', workerId] });
    },
  });
}

export function useDeleteWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workerId: string) => api.delete<void>(`/workers/${workerId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}
