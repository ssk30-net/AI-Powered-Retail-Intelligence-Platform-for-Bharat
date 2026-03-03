'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/app/components/Sidebar';
import { AIAssistant } from '@/app/components/AIAssistant';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    if (!token && !isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (token && !user) {
      fetchUser();
      return;
    }
    if (token && user?.is_first_login && pathname !== '/ingest') {
      router.replace('/ingest');
    }
  }, [token, isAuthenticated, user, user?.is_first_login, pathname, router, fetchUser]);

  // Show loading or nothing while checking auth
  if (!token && !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <AIAssistant />
    </div>
  );
}
