import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: ordersApi.getOrders, staleTime: 15_000 });
}
