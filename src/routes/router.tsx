import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppShell } from '@/components/layouts/AppShell';
import { PageLoader } from '@/components/shared/PageLoader';

const Splash = lazy(() => import('@/features/onboarding/components/Splash'));
const Onboarding = lazy(() => import('@/features/onboarding/components/Onboarding'));
const Dashboard = lazy(() => import('@/features/dashboard/components/DashboardPage'));
const Products = lazy(() => import('@/features/products/components/ProductsPage'));
const ProductDetails = lazy(() => import('@/features/products/components/ProductDetailsPage'));
const Checkout = lazy(() => import('@/features/checkout/components/CheckoutPage'));
const OrderSuccess = lazy(() => import('@/features/checkout/components/OrderSuccessPage'));
const Orders = lazy(() => import('@/features/orders/components/OrdersPage'));
const Analytics = lazy(() => import('@/features/analytics/components/AnalyticsPage'));
const Settings = lazy(() => import('@/features/settings/components/SettingsPage'));
const NotFound = lazy(() => import('@/components/shared/NotFoundPage'));

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  { path: '/splash', element: withSuspense(<Splash />) },
  { path: '/onboarding', element: withSuspense(<Onboarding />) },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: withSuspense(<Dashboard />) },
      { path: 'products', element: withSuspense(<Products />) },
      { path: 'products/:id', element: withSuspense(<ProductDetails />) },
      { path: 'checkout', element: withSuspense(<Checkout />) },
      { path: 'order-success/:id', element: withSuspense(<OrderSuccess />) },
      { path: 'orders', element: withSuspense(<Orders />) },
      { path: 'analytics', element: withSuspense(<Analytics />) },
      { path: 'settings', element: withSuspense(<Settings />) },
      { path: '*', element: withSuspense(<NotFound />) },
    ],
  },
], {
  basename: '/japan-expo',
});
