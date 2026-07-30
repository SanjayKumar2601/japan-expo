import type { Category, Product, Order } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'cat-pottery', name: 'Pottery', nameJa: '陶器', icon: 'amphora', itemCount: 45 },
  { id: 'cat-lamps', name: 'Lamps', nameJa: '行灯', icon: 'lamp', itemCount: 28 },
  { id: 'cat-decor', name: 'Decor', nameJa: '装飾', icon: 'flower-2', itemCount: 32 },
  { id: 'cat-art', name: 'Art', nameJa: '芸術', icon: 'brush', itemCount: 18 },
  { id: 'cat-other', name: 'Others', nameJa: 'その他', icon: 'sparkles', itemCount: 12 },
  { id: 'cat-stationery', name: 'Stationery', nameJa: '文房具', icon: 'pen-tool', itemCount: 22 },
];

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=400&q=60`;

export const PRODUCTS: Product[] = [
  { id: 'p-clay-pot', name: 'Clay Pot', nameJa: '土鍋', categoryId: 'cat-pottery', categoryName: 'Pottery', price: 450, stock: 15, imageUrl: img('photo-1610701596007-11502861dcfa'), description: 'Handcrafted clay pot made by local artisans.', soldCount: 28 },
  { id: 'p-vase', name: 'Ceramic Vase', nameJa: '花瓶', categoryId: 'cat-pottery', categoryName: 'Pottery', price: 700, stock: 9, imageUrl: img('photo-1578500494198-246f612d3b3d'), soldCount: 14 },
  { id: 'p-big-vase', name: 'Large Vase', nameJa: '大花瓶', categoryId: 'cat-pottery', categoryName: 'Pottery', price: 800, stock: 4, imageUrl: img('photo-1616627561950-9f746e330187'), soldCount: 6 },
  { id: 'p-lamp', name: 'Paper Lamp', nameJa: '行灯', categoryId: 'cat-lamps', categoryName: 'Lamps', price: 900, stock: 11, imageUrl: img('photo-1543198126-b9ba0e5c5b3a'), soldCount: 19 },
  { id: 'p-decor-plate', name: 'Decor Plate', nameJa: '飾り皿', categoryId: 'cat-decor', categoryName: 'Decor', price: 650, stock: 20, imageUrl: img('photo-1600431521340-491eca880813'), soldCount: 10 },
  { id: 'p-painting', name: 'Mt. Fuji Painting', nameJa: '富士山の絵', categoryId: 'cat-art', categoryName: 'Art', price: 1200, stock: 6, imageUrl: img('photo-1578662996442-48f60103fc96'), soldCount: 8 },
  { id: 'p-fan', name: 'Folding Fan', nameJa: '扇子', categoryId: 'cat-decor', categoryName: 'Decor', price: 380, stock: 30, imageUrl: img('photo-1601921004897-b7d582fdb9d1'), soldCount: 22 },
  { id: 'p-bonsai', name: 'Mini Bonsai', nameJa: '盆栽', categoryId: 'cat-other', categoryName: 'Others', price: 950, stock: 7, imageUrl: img('photo-1610850269089-8bd5023f24dd'), soldCount: 5 },
  { id: 'p-brush', name: 'Calligraphy Set', nameJa: '書道セット', categoryId: 'cat-stationery', categoryName: 'Stationery', price: 520, stock: 14, imageUrl: img('photo-1519791883288-dc8bd696e667'), soldCount: 9 },
];

export function buildRecentOrders(): Order[] {
  const now = Date.now();
  return [
    {
      id: 'o-1052', orderNumber: '#1052', status: 'completed', paymentMethod: 'upi', customerName: 'Rahul',
      createdAt: new Date(now - 1000 * 60 * 20).toISOString(), synced: true, total: 1850,
      items: [
        { productId: 'p-clay-pot', productName: 'Clay Pot', price: 450, quantity: 2, imageUrl: img('photo-1610701596007-11502861dcfa') },
        { productId: 'p-vase', productName: 'Ceramic Vase', price: 700, quantity: 1, imageUrl: img('photo-1578500494198-246f612d3b3d') },
        { productId: 'p-lamp', productName: 'Paper Lamp', price: 900, quantity: 1, imageUrl: img('photo-1543198126-b9ba0e5c5b3a') },
      ],
    },
    {
      id: 'o-1051', orderNumber: '#1051', status: 'completed', paymentMethod: 'cash', customerName: 'Sneha',
      createdAt: new Date(now - 1000 * 60 * 75).toISOString(), synced: true, total: 1200,
      items: [{ productId: 'p-painting', productName: 'Mt. Fuji Painting', price: 1200, quantity: 1, imageUrl: img('photo-1578662996442-48f60103fc96') }],
    },
    {
      id: 'o-1050', orderNumber: '#1050', status: 'completed', paymentMethod: 'card', customerName: 'Amit',
      createdAt: new Date(now - 1000 * 60 * 130).toISOString(), synced: true, total: 2450,
      items: [
        { productId: 'p-bonsai', productName: 'Mini Bonsai', price: 950, quantity: 1, imageUrl: img('photo-1610850269089-8bd5023f24dd') },
        { productId: 'p-decor-plate', productName: 'Decor Plate', price: 650, quantity: 2, imageUrl: img('photo-1600431521340-491eca880813') },
      ],
    },
  ];
}
