import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: productsApi.getProducts, staleTime: 60_000 });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: productsApi.getCategories, staleTime: 60_000 });
}
