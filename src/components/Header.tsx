'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary-600">Yomu</div>
        </div>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/readings" className="text-sm text-slate-600 hover:text-primary-600">
                Bacaan
              </Link>
              <Link href="/clans" className="text-sm text-slate-600 hover:text-primary-600">
                Clan
              </Link>
              <Link href="/leaderboard" className="text-sm text-slate-600 hover:text-primary-600">
                Leaderboard
              </Link>
              <Link href="/achievements" className="text-sm text-slate-600 hover:text-primary-600">
                Achievements
              </Link>
              <Link href="/missions" className="text-sm text-slate-600 hover:text-primary-600">
                Misi
              </Link>
              <Link href="/profile" className="text-sm text-slate-600 hover:text-primary-600">
                Profil
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-600 hover:text-primary-600">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}