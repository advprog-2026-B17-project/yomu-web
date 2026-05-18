'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Clan {
  id: string;
  name: string;
  tier: string;
  totalScore: number;
  leaderId: string;
  leaderName: string;
  memberCount: number;
}

export default function AdminClansPage() {
  const { user, token } = useAuth();
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchClans();
  }, [user, token]);

  const fetchClans = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setClans(await res.json());
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteClan = async (id: string) => {
    if (confirm('Hapus clan ini?')) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClans();
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Kelola Clan</h2>

      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : clans.length === 0 ? (
        <p className="text-slate-500">Belum ada clan.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Leader</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Skor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Anggota</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clans.map((clan) => (
                <tr key={clan.id}>
                  <td className="px-6 py-4 font-medium">{clan.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      clan.tier === 'diamond' ? 'bg-purple-100 text-purple-700' :
                      clan.tier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                      clan.tier === 'silver' ? 'bg-gray-100 text-gray-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {clan.tier.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{clan.leaderName}</td>
                  <td className="px-6 py-4 text-right">{clan.totalScore.toFixed(0)}</td>
                  <td className="px-6 py-4 text-right">{clan.memberCount}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteClan(clan.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}