'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/app/components/Sidebar';
import { AIAssistant } from '@/app/components/AIAssistant';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!token && !isAuthenticated) {
      router.replace('/login');
    }
  }, [token, isAuthenticated, router]);

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
