import { IndianRupee, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { TopBar } from '@/components/layouts/TopBar';
import { PageTransition } from '@/components/shared/PageTransition';
import { useAnalytics } from '../hooks/useAnalytics';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { PaymentSplitCard } from '@/features/dashboard/components/PaymentSplitCard';
import { WeeklyRevenueChart } from './WeeklyRevenueChart';
import { TopProductsCard } from './TopProductsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatYen } from '@/utils/format';

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  return (
    <PageTransition>
      <TopBar title="Analytics" subtitle="Performance overview for today" />
      <div className="space-y-5 px-4 pb-28 sm:px-6 md:pb-8">
        {isLoading || !data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Revenue" value={data.revenue} formatter={formatYen} changePercent={data.revenueChangePercent} icon={<IndianRupee className="h-4 w-4" />} accent="primary" />
              <StatCard label="Orders" value={data.orders} changePercent={data.ordersChangePercent} icon={<ShoppingBag className="h-4 w-4" />} accent="blue" />
              <StatCard label="Profit" value={data.profit} formatter={formatYen} changePercent={data.profitChangePercent} icon={<TrendingUp className="h-4 w-4" />} accent="success" />
              <StatCard label="Avg Order Value" value={data.avgOrderValue} formatter={formatYen} icon={<Wallet className="h-4 w-4" />} accent="purple" />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <WeeklyRevenueChart data={data.weeklyRevenue} />
              <PaymentSplitCard
                data={data.paymentSplit.map((p) => ({ method: p.method, amount: p.percent }))}
              />
            </div>

            <TopProductsCard topProducts={data.topProducts} />
          </>
        )}
      </div>
    </PageTransition>
  );
}
