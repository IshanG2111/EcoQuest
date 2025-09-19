'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BarChart, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { AuthGuard, useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: 'Dashboard', href: '/teacher', icon: Home },
    { name: 'Analytics', href: '/teacher/analytics', icon: BarChart },
  ];
  const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="space-y-6">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              <p className="text-muted-foreground">
                Tools for creating and monitoring learning experiences.
              </p>
            </div>
            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <Button key={item.name} variant="outline" asChild>
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </nav>
          </header>
          <Separator />
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
