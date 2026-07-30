import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, ShoppingBag, TrendingUp, Plus, PackageSearch, BarChart3 } from 'lucide-react';
import { TopBar } from '@/components/layouts/TopBar';
import { PageTransition } from '@/components/shared/PageTransition';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard } from './StatCard';
import { PaymentSplitCard } from './PaymentSplitCard';
import { RecentOrdersCard } from './RecentOrdersCard';
import { DashboardSkeleton } from './DashboardSkeleton';
import { Card } from '@/components/ui/Card';
import { formatYen } from '@/utils/format';

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <PageTransition>
      <TopBar title={`${greeting}, Rahul 👋`} subtitle="Here's how your expo booth is doing today" />

      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-5 px-4 pb-28 sm:px-6 md:pb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Revenue Today"
              value={data.revenueToday}
              formatter={formatYen}
              changePercent={data.revenueChangePercent}
              icon={<IndianRupee className="h-4 w-4" />}
              accent="primary"
            />
            <StatCard
              label="Orders Today"
              value={data.ordersToday}
              changePercent={data.ordersChangePercent}
              icon={<ShoppingBag className="h-4 w-4" />}
              accent="blue"
            />
            <StatCard
              label="Avg Order Value"
              value={data.avgOrderValue}
              formatter={formatYen}
              changePercent={data.avgOrderChangePercent}
              icon={<TrendingUp className="h-4 w-4" />}
              accent="purple"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card padding="lg" className="gradient-primary overflow-hidden border-none text-white">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">
                    {data.pendingSyncCount > 0 ? `${data.pendingSyncCount} orders pending sync` : 'All orders synced'}
                  </p>
                  <p className="mt-1 text-lg font-bold">Start a new sale</p>
                </div>
                <button
                  onClick={() => navigate('/products')}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <PaymentSplitCard data={data.paymentSplit} />
            <Card padding="md">
              <p className="mb-3 text-sm font-bold">Quick Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <QuickAction icon={<PackageSearch className="h-5 w-5" />} label="Products" onClick={() => navigate('/products')} />
                <QuickAction icon={<BarChart3 className="h-5 w-5" />} label="Analytics" onClick={() => navigate('/analytics')} />
              </div>
            </Card>
          </div>

          <RecentOrdersCard orders={data.recentOrders} />
        </div>
      )}
    </PageTransition>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] py-5 text-sm font-semibold text-[var(--color-text)]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        {icon}
      </span>
      {label}
    </motion.button>
  );
}
