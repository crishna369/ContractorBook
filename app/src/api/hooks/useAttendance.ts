import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { AttendanceEntry, AttendanceSaveInput } from '../../types/api';

export function useAttendanceForDate(date: string) {
  return useQuery({
    queryKey: ['attendance', date],
    queryFn: () => api.get<AttendanceEntry[]>(`/attendance?date=${date}`),
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AttendanceSaveInput) => api.post<AttendanceEntry[]>('/attendance', input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.date] });
    },
  });
}
