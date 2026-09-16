import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { LedgerBalances, LedgerTransaction, OpeningBalanceInput } from '../../types/api';

type OpeningBalanceOut = { opening_cash: string; opening_bank: string; as_of_date: string; updated_at: string };

export function useLedgerBalances() {
  return useQuery({
    queryKey: ['ledger', 'balances'],
    queryFn: () => api.get<LedgerBalances>('/ledger/balances'),
  });
}

export function useLedgerTransactions(method?: 'cash' | 'bank') {
  return useQuery({
    queryKey: ['ledger', 'transactions', method ?? 'all'],
    queryFn: () =>
      api.get<LedgerTransaction[]>(method ? `/ledger/transactions?method=${method}` : '/ledger/transactions'),
  });
}

export function useSetOpeningBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OpeningBalanceInput) => api.put<OpeningBalanceOut>('/ledger/opening-balance', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
