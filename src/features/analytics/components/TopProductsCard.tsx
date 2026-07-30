import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatYen } from '@/utils/format';
import type { AnalyticsData } from '@/types';

export function TopProductsCard({ topProducts }: { topProducts: AnalyticsData['topProducts'] }) {
  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <ul className="space-y-3">
        {topProducts.map((entry, i) => (
          <motion.li
            key={entry.product.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
              {i + 1}
            </span>
            <img src={entry.product.imageUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{entry.product.name}</p>
              <p className="text-xs text-[var(--color-muted)]">{entry.unitsSold} sold</p>
            </div>
            <span className="text-sm font-extrabold text-[var(--color-primary)]">{formatYen(entry.revenue)}</span>
          </motion.li>
        ))}
      </ul>
    </Card>
  );
}
