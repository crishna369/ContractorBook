import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { Site, SiteCreateInput, SiteUpdateInput } from '../../types/api';

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
