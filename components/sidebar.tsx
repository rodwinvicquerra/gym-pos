'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Members', href: '/members' },
  { name: 'Check-in', href: '/checkin' },
  { name: 'Walk-ins', href: '/walkins' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Reports', href: '/reports' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-64 bg-card border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-foreground">Gym POS</h1>
        <p className="text-xs text-muted-foreground mt-1">Point of Sale System</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname.startsWith(item.href) ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button
          onClick={handleLogout}
          disabled={isLoading}
          variant="destructive"
          className="w-full"
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </aside>
  );
}
