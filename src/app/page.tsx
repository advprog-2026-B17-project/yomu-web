'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
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
                <Link href="/achievements" className="text-sm text-slate-600 hover:text-primary-600">
                  Achievements
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

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          Belajar Membaca dengan{' '}
          <span className="text-primary-600">Tepat</span> dan{' '}
          <span className="text-primary-600">Saksama</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Yomu melatih kemampuan literasi informasi melalui bacaan dan kuis interaktif.
          Kumpulkan achievement, naik level, dan bergabung dengan clan untuk belajar bersama.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-primary-600 px-6 py-3 text-lg font-medium text-white hover:bg-primary-700"
          >
            Mulai Belajar
          </Link>
          <Link
            href="/readings"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-lg font-medium text-slate-700 hover:bg-slate-50"
          >
            Lihat Bacaan
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fitur Utama</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-50">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-xl font-semibold mb-2">Bacaan Beragam</h3>
              <p className="text-slate-600">
                Beragam teks dari kategori News & Media, Olahraga, dan lainnya untuk melatih pemahaman.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Sistem Achievement</h3>
              <p className="text-slate-600">
                Kumpulkan achievement dengan menyelesaikan bacaan dan daily missions.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50">
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-semibold mb-2">Sistem Liga</h3>
              <p className="text-slate-600">
                Bergabung dengan clan dan bersaing di leaderboard untuk naik tier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-slate-500">
          <p>© 2026 Yomu. Aplikasi Pembelajaran Literasi Informasi.</p>
        </div>
      </footer>
    </div>
  );
}
