import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settingsApi';
import type { AppSettings } from '@/types';

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: settingsApi.getSettings, staleTime: Infinity });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<AppSettings>) => settingsApi.updateSettings(patch),
    onSuccess: (data) => queryClient.setQueryData(['settings'], data),
  });
}
