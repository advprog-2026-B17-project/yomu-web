'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const adminNav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/readings', label: 'Bacaan' },
  { href: '/admin/missions', label: 'Misi Harian' },
  { href: '/admin/clans', label: 'Clan' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Yomu Admin</h1>
          <nav className="flex items-center gap-4">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm px-3 py-1 rounded ${
                  pathname === item.href
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/readings" className="text-sm text-slate-300 hover:text-white ml-4">
              ← Kembali ke User App
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}