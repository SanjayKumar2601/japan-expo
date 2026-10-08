function generateClientOrderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

import { apiClient, adminHeaders } from './apiClient';
import { offlineDb } from './db';
import type { AnalyticsData, AppSettings, Category, DashboardSummary, Order, Product } from '@/types';
export const getCategories = async (): Promise<Category[]> => (await apiClient.get('/categories')).data;
export const getProducts = async (): Promise<Product[]> => (await apiClient.get('/products')).data;
export const getDashboard = async (): Promise<DashboardSummary> => (await apiClient.get('/dashboard')).data;
export const getOrders = async (): Promise<Order[]> => (await apiClient.get('/orders')).data;
export const getAnalytics = async (): Promise<AnalyticsData> => (await apiClient.get('/analytics')).data;
export const getSettings = async (): Promise<AppSettings> => (await apiClient.get('/settings')).data;
export const updateSettings = async (patch: Partial<AppSettings>): Promise<AppSettings> => (await apiClient.patch('/settings', patch)).data;
export type ProductInput = Pick<Product,'name'|'categoryId'|'price'|'stock'> & Partial<Pick<Product,'nameJa'|'imageUrl'|'description'>> & {costPrice?: number};
export const createProduct = async (input: ProductInput): Promise<Product> => (await apiClient.post('/products', input, { headers: adminHeaders() })).data;
export const updateProduct = async (id:string,input:ProductInput): Promise<Product> => (await apiClient.put('/products/'+encodeURIComponent(id), input, { headers: adminHeaders() })).data;
export const deleteProduct = async (id: string): Promise<void> => { await apiClient.delete('/products/' + encodeURIComponent(id), { headers: adminHeaders() }); };
export const createCategory = async (input:{name:string;nameJa?:string;icon?:string}):Promise<Category> => (await apiClient.post('/categories', input)).data;
function makeClientOrderId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function createOrder(input: {items:Order['items'];total:number;paymentMethod:Order['paymentMethod'];customerName?:string;notes?:string;operatorName?:string}):Promise<Order>{
  const clientOrderId = makeClientOrderId();
  const payload = { ...input, clientOrderId };
  if(navigator.onLine){ const response=await apiClient.post<Order>('/orders', payload); await offlineDb.cacheOrder({...response.data, synced:true}); return response.data; }
  const order:Order={...input,id:'local-'+clientOrderId,orderNumber:'Pending',status:'pending',createdAt:new Date().toISOString(),synced:false};
  await offlineDb.queueOrder(order);return order;
}
export async function syncPendingOrders():Promise<{syncedCount:number}>{
  const pending=await offlineDb.getPendingOrders();let syncedCount=0;
  if(!navigator.onLine)return {syncedCount};
  for(const order of pending){
    try{const response=await apiClient.post<Order>('/orders',{items:order.items,total:order.total,paymentMethod:order.paymentMethod,customerName:order.customerName,notes:order.notes,clientOrderId:order.id.replace(/^local-/, ''),operatorName:order.operatorName});
      await offlineDb.cacheOrder({...response.data,synced:true});await offlineDb.removePendingOrder(order.id);syncedCount++;
    }catch(error){console.error('Order sync failed',error);break;}
  }
  return {syncedCount};
}
