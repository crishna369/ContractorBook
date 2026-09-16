import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import type { Dashboard } from '../../types/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<Dashboard>('/dashboard'),
  });
}
