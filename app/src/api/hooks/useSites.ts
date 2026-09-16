import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { Site, SiteCreateInput, SiteReport, SiteUpdateInput } from '../../types/api';

export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: () => api.get<Site[]>('/sites'),
  });
}

export function useSite(siteId: string) {
  return useQuery({
    queryKey: ['sites', siteId],
    queryFn: () => api.get<Site>(`/sites/${siteId}`),
    enabled: !!siteId,
  });
}

export function useSiteReport(siteId: string, dateFrom?: string | null, dateTo?: string | null) {
  const params = new URLSearchParams();
  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);
  const qs = params.toString();
  return useQuery({
    queryKey: ['sites', siteId, 'report', dateFrom ?? null, dateTo ?? null],
    queryFn: () => api.get<SiteReport>(`/sites/${siteId}/report${qs ? `?${qs}` : ''}`),
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SiteCreateInput) => api.post<Site>('/sites', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'] }),
  });
}

export function useUpdateSite(siteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SiteUpdateInput) => api.patch<Site>(`/sites/${siteId}`, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(['sites', siteId], updated);
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (siteId: string) => api.delete<void>(`/sites/${siteId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'] }),
  });
}
