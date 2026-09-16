import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { BillReceipt, BillReceiptInput, ClientBill, ClientBillDetail, ClientBillInput } from '../../types/api';

export function useBills(siteId?: string) {
  return useQuery({
    queryKey: ['bills', siteId ?? 'all'],
    queryFn: () => api.get<ClientBill[]>(siteId ? `/bills?site_id=${siteId}` : '/bills'),
  });
}

export function useBillDetail(billId: string | undefined) {
  return useQuery({
    queryKey: ['bills', 'detail', billId],
    queryFn: () => api.get<ClientBillDetail>(`/bills/${billId}`),
    enabled: !!billId,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientBillInput) => api.post<ClientBill>('/bills', input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills', variables.site_id] });
      queryClient.invalidateQueries({ queryKey: ['bills', 'all'] });
    },
  });
}

export function useCreateReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BillReceiptInput) => api.post<BillReceipt>(`/bills/${input.bill_id}/receipts`, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills', 'detail', variables.bill_id] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}
