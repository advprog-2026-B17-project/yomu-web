'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface SeasonInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

interface LeaderboardEntry {
  clanId: string;
  clanName: string;
  tier: string;
  totalScore: number;
  memberCount: number;
  multiplier: number;
  effectiveScore: number;
}

export default function LeaderboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [season, setSeason] = useState<SeasonInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clans/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, token, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>

        {loading ? (
          <p className="text-slate-500">Memuat...</p>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-slate-500">Belum ada data clan.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            {leaderboard.map((clan, idx) => (
              <div
                key={clan.clanId}
                className="flex items-center justify-between p-4 border-b last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    idx === 0 ? 'bg-amber-400 text-white' :
                    idx === 1 ? 'bg-gray-300 text-white' :
                    idx === 2 ? 'bg-amber-600 text-white' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{clan.clanName}</p>
                    <p className="text-sm text-slate-500">{clan.memberCount} anggota</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{clan.effectiveScore.toFixed(0)}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    clan.tier === 'diamond' ? 'bg-purple-100 text-purple-700' :
                    clan.tier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                    clan.tier === 'silver' ? 'bg-gray-100 text-gray-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {clan.tier.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}