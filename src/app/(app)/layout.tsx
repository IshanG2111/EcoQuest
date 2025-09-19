import React from 'react';
import { AuthGuard } from '@/hooks/use-auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="h-[calc(100vh-40px)] w-full relative">
          {children}
      </div>
    </AuthGuard>
  );
}
