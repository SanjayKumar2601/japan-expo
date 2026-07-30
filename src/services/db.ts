import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Order } from '@/types';

interface ExpoDB extends DBSchema {
  pendingOrders: {
    key: string;
    value: Order;
  };
  orderCache: {
    key: string;
    value: Order;
  };
}

let dbInstance: Promise<IDBPDatabase<ExpoDB>> | null = null;

function getDB() {
  if (!dbInstance) {
    dbInstance = openDB<ExpoDB>('expo-sales-tracker', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('pendingOrders')) {
          db.createObjectStore('pendingOrders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('orderCache')) {
          db.createObjectStore('orderCache', { keyPath: 'id' });
        }
      },
    });
  }
  return dbInstance;
}

export const offlineDb = {
  async queueOrder(order: Order) {
    const db = await getDB();
    await db.put('pendingOrders', order);
  },
  async getPendingOrders(): Promise<Order[]> {
    const db = await getDB();
    return db.getAll('pendingOrders');
  },
  async removePendingOrder(id: string) {
    const db = await getDB();
    await db.delete('pendingOrders', id);
  },
  async cacheOrder(order: Order) {
    const db = await getDB();
    await db.put('orderCache', order);
  },
  async getCachedOrders(): Promise<Order[]> {
    const db = await getDB();
    return db.getAll('orderCache');
  },
};
