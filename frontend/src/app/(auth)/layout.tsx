'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if ((token || isAuthenticated) && (pathname === '/login' || pathname === '/register')) {
      router.replace('/dashboard');
    }
  }, [token, isAuthenticated, pathname, router]);

  return <>{children}</>;
}
