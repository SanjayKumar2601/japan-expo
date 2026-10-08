import type { Order } from '@/types';

const USER_STORAGE_KEY = 'expo-pos-device-user-v1';

function sanitize(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown';
}

export function getDeviceUser(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_STORAGE_KEY);
}

export function getOrAskDeviceUser(): string | null {
  const existing = getDeviceUser();
  if (existing) return existing;

  const entered = window.prompt('Enter your POS staff/user name. This is stored only on this device and used in receipt filenames.');
  const name = entered?.trim();
  if (!name) return null;
  localStorage.setItem(USER_STORAGE_KEY, name);
  return name;
}

export function setDeviceUser(name: string) {
  const value = name.trim();
  if (!value) return;
  localStorage.setItem(USER_STORAGE_KEY, value);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) line = candidate;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function createReceiptPng(order: Order, operatorName?: string): Promise<Blob> {
  const user = operatorName || getDeviceUser() || 'Unknown User';
  const width = 720;
  const left = 54;
  const right = width - left;
  const itemLineHeight = 34;
  const height = 520 + order.items.reduce((sum, item) => sum + Math.max(1, Math.ceil(item.productName.length / 26)) * itemLineHeight, 0);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Receipt canvas is unavailable');

  ctx.fillStyle = '#f5f5f2';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(42, 30, width - 84, height - 60);

  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.font = '700 30px monospace';
  ctx.fillText('CASH RECEIPT', width / 2, 82);

  ctx.textAlign = 'left';
  ctx.font = '16px monospace';
  ctx.fillText('Shop Name', left, 128);
  ctx.textAlign = 'right';
  ctx.fillText('JAPAN EXPO POS', right, 128);
  ctx.textAlign = 'left';
  ctx.fillText('Operator', left, 153);
  ctx.textAlign = 'right';
  ctx.fillText(user, right, 153);
  ctx.textAlign = 'left';
  ctx.fillText('Customer', left, 178);
  ctx.textAlign = 'right';
  ctx.fillText(order.customerName || 'Walk-in Customer', right, 178);
  ctx.textAlign = 'left';
  ctx.fillText('Order', left, 203);
  ctx.textAlign = 'right';
  ctx.fillText(order.orderNumber, right, 203);
  ctx.textAlign = 'left';
  ctx.fillText('Date', left, 228);
  ctx.textAlign = 'right';
  ctx.fillText(new Date(order.createdAt).toLocaleString(), right, 228);

  ctx.strokeStyle = '#cccccc';
  ctx.beginPath();
  ctx.moveTo(left, 250);
  ctx.lineTo(right, 250);
  ctx.stroke();

  ctx.font = '700 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Description', left, 278);
  ctx.textAlign = 'right';
  ctx.fillText('Price', right, 278);

  let y = 314;
  ctx.font = '16px monospace';
  ctx.textAlign = 'left';
  for (const item of order.items) {
    const price = item.salePrice ?? item.price;
    const lines = wrapText(ctx, `${item.quantity} × ${item.productName}`, 420);
    for (const line of lines) {
      ctx.textAlign = 'left';
      ctx.fillText(line, left, y);
      y += itemLineHeight;
    }
    ctx.textAlign = 'right';
    ctx.fillText(formatMoney(price * item.quantity), right, y - itemLineHeight);
  }

  ctx.strokeStyle = '#cccccc';
  ctx.beginPath();
  ctx.moveTo(left, y + 8);
  ctx.lineTo(right, y + 8);
  ctx.stroke();

  y += 46;
  ctx.font = '16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Payment', left, y);
  ctx.textAlign = 'right';
  ctx.fillText(order.paymentMethod.toUpperCase(), right, y);

  y += 34;
  ctx.textAlign = 'left';
  ctx.fillText('Subtotal', left, y);
  ctx.textAlign = 'right';
  ctx.fillText(formatMoney(order.total), right, y);

  y += 40;
  ctx.font = '700 21px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Total', left, y);
  ctx.textAlign = 'right';
  ctx.fillText(formatMoney(order.total), right, y);

  y += 52;
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#666666';
  ctx.fillText('Thank you for visiting Japan Expo!', width / 2, y);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Unable to create receipt image'))), 'image/png');
  });
}

function formatMoney(value: number) {
  return `₹${value.toFixed(2)}`;
}

export async function downloadReceipt(order: Order, operatorName?: string) {
  const user = operatorName || getOrAskDeviceUser() || 'Unknown User';
  const blob = await createReceiptPng(order, user);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${sanitize(order.customerName || 'Walk-in_Customer')}_${sanitize(order.orderNumber)}_${sanitize(user)}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function printReceipt(order: Order, operatorName?: string) {
  const user = operatorName || getOrAskDeviceUser() || 'Unknown User';
  const blob = await createReceiptPng(order, user);
  const url = URL.createObjectURL(blob);
  const popup = window.open('', '_blank', 'width=520,height=760');
  if (!popup) throw new Error('Popup blocked. Allow popups for the POS to print receipts.');
  popup.document.write(`<!doctype html><html><head><title>${sanitize(order.orderNumber)} receipt</title><style>body{margin:0;padding:24px;background:#eee;font-family:Arial,sans-serif;text-align:center}img{width:min(100%,480px);height:auto;background:#fff}@media print{body{padding:0;background:#fff}img{width:100%;max-width:480px}}</style></head><body><img src="${url}" alt="Receipt" /><script>window.onload=()=>setTimeout(()=>window.print(),250);</script></body></html>`);
  popup.document.close();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
