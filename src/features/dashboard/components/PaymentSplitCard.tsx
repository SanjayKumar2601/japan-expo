import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatYen } from '@/utils/format';
import type { PaymentMethod } from '@/types';

const COLORS: Record<PaymentMethod, string> = {
  upi: '#FF6B00',
  cash: '#4D7CFE',
  card: '#7E57FF',
  qr: '#2CB67D',
};

const LABELS: Record<PaymentMethod, string> = {
  upi: 'UPI',
  cash: 'Cash',
  card: 'Card',
  qr: 'QR',
};

export function PaymentSplitCard({ data }: { data: { method: PaymentMethod; amount: number }[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Payment Split</CardTitle>
      </CardHeader>
      <div className="flex items-center gap-4">
        <div className="h-28 w-28 shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="amount" innerRadius={34} outerRadius={54} paddingAngle={3} animationDuration={900}>
                {data.map((entry) => (
                  <Cell key={entry.method} fill={COLORS[entry.method]} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-2">
          {data.map((d) => (
            <li key={d.method} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-[var(--color-text)]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[d.method] }} />
                {LABELS[d.method]}
              </span>
              <span className="font-semibold text-[var(--color-muted)]">
                {Math.round((d.amount / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-right text-xs text-[var(--color-muted)]">Total {formatYen(total)}</p>
    </Card>
  );
}
