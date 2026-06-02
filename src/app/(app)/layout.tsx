import React from 'react';
import { AuthGuard } from '@/hooks/use-auth';
import { DesktopProvider } from '@/components/desktop-context';
import { DesktopLayout } from '@/components/desktop-layout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DesktopProvider>
        <DesktopLayout>
          {children}
        </DesktopLayout>
      </DesktopProvider>
    </AuthGuard>
  );
}
