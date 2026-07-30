import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <EmptyState
        icon={<Compass className="h-10 w-10" />}
        title="404 — Page not found"
        description="This page wandered off somewhere. Let's get you back to the dashboard."
        actionLabel="Back to Dashboard"
        onAction={() => navigate('/')}
      />
    </div>
  );
}
