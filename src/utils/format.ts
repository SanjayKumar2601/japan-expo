export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString('en-IN')}`;
}

export function formatCompactYen(amount: number): string {
  if (amount >= 100000) return `¥${(amount / 1000).toFixed(0)}K`;
  return formatYen(amount);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
