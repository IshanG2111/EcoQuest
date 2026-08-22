import React from 'react';
import { DesktopProvider } from '@/components/desktop-context';
import { DesktopLayout } from '@/components/desktop-layout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesktopProvider>
      <DesktopLayout>
        {children}
      </DesktopLayout>
    </DesktopProvider>
  );
}
