'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AppLoader } from '@/components/ui/app-loader';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/desktop');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <AppLoader
      title="Loading EcoQuest"
      subtitle="Preparing your learning world and checking your session..."
    />
  );
}
