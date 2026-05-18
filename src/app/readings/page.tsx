'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface Reading {
  id: string;
  title: string;
  category: { name: string } | null;
  createdAt: string;
}

export default function ReadingsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchReadings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/readings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setReadings(data);
        }
      } catch (err) {
        console.error('Failed to fetch readings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, [user, token, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Pilih Bacaan</h2>
        </div>

        {loading ? (
          <p className="text-slate-500">Memuat...</p>
        ) : readings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-slate-500">Belum ada bacaan.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {readings.map((reading) => (
              <Link
                key={reading.id}
                href={`/readings/${reading.id}`}
                className="block p-6 bg-white rounded-xl border hover:border-primary-500 transition-colors"
              >
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  {reading.category?.name || 'Umum'}
                </span>
                <h3 className="text-lg font-semibold mt-2">{reading.title}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(reading.createdAt).toLocaleDateString('id-ID')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}