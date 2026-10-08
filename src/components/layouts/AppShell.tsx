import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { FloatingActionButton } from './FloatingActionButton';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { CartChooserModal } from '@/features/cart/components/CartChooserModal';
import { Toaster } from '@/components/shared/Toaster';
import { FlyingCartLayer } from '@/components/shared/FlyingCartLayer';
import { useNetworkSync } from '@/hooks/useNetworkSync';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

export function AppShell() {
  useNetworkSync();
  useRealtimeNotifications();

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
        <Outlet />
      </div>
      <BottomNav />
      <FloatingActionButton />
      <CartDrawer />
      <CartChooserModal />
      <FlyingCartLayer />
      <Toaster />
    </div>
  );
}
