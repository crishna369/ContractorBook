import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { SiteExpense, SiteExpenseInput } from '../../types/api';

export function useExpenses(siteId?: string) {
  return useQuery({
    queryKey: ['site-expenses', siteId ?? 'all'],
    queryFn: () => api.get<SiteExpense[]>(siteId ? `/site-expenses?site_id=${siteId}` : '/site-expenses'),
  });
}

export function useQuickDescriptions(siteId: string) {
  return useQuery({
    queryKey: ['site-expenses', siteId, 'quick-descriptions'],
    queryFn: () => api.get<string[]>(`/site-expenses/quick-descriptions?site_id=${siteId}`),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SiteExpenseInput) => api.post<SiteExpense>('/site-expenses', input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['site-expenses', variables.site_id] });
      queryClient.invalidateQueries({ queryKey: ['site-expenses', 'all'] });
    },
  });
}
