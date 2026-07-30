import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutApi } from '../api/checkoutApi';
import { useNetworkStore } from '@/store/networkStore';
import type { Order } from '@/types';

interface CreateOrderInput {
  items: Order['items'];
  total: number;
  paymentMethod: Order['paymentMethod'];
  customerName?: string;
  notes?: string;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const setPendingCount = useNetworkStore((s) => s.setPendingCount);

  return useMutation({
    mutationFn: (input: CreateOrderInput) => checkoutApi.createOrder(input),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (!order.synced) {
        setPendingCount(1);
      }
    },
  });
}
