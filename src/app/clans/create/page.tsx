'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function CreateClanPage() {
  const [name, setName] = useState('');
  const { user, token } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama clan tidak boleh kosong', 'warning');
      return;
    }
    if (creating) return;

    setCreating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clans?name=${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Clan berhasil dibuat!', 'success');
        router.push('/clans');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Gagal membuat clan', 'error');
      }
    } catch {
      showToast('Error koneksi', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-6">Buat Clan Baru</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Clan</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Masukkan nama clan"
              required
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {creating ? 'Membuat...' : 'Buat Clan'}
          </button>
        </form>
      </div>
    </div>
  );
}