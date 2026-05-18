'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Mission {
  id: string;
  title: string;
  description: string;
  targetType: string;
  targetCount: number;
  xpReward: number;
  isActive: boolean;
}

export default function AdminMissionsPage() {
  const { user, token } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetType: 'reading',
    targetCount: 3,
    xpReward: 10,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchMissions();
  }, [user, token]);

  const fetchMissions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/missions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMissions(await res.json());
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ title: '', description: '', targetType: 'reading', targetCount: 3, xpReward: 10 });
        fetchMissions();
      }
    } catch {
      alert('Error');
    }
  };

  const toggleMission = async (id: string, active: boolean) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/missions/${id}/toggle?active=${!active}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMissions();
  };

  const deleteMission = async (id: string) => {
    if (confirm('Hapus misi ini?')) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/missions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMissions();
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Kelola Misi Harian</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
        >
          {showForm ? 'Batal' : '+ Tambah Misi'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-white rounded-xl border space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul Misi</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Membaca Berita"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target Type</label>
              <select
                value={form.targetType}
                onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="reading">Reading</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Count</label>
              <input
                type="number"
                value={form.targetCount}
                onChange={(e) => setForm({ ...form, targetCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">XP Reward</label>
              <input
                type="number"
                value={form.xpReward}
                onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min={1}
              />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
            Simpan
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : missions.length === 0 ? (
        <p className="text-slate-500">Belum ada misi.</p>
      ) : (
        <div className="space-y-4">
          {missions.map((m) => (
            <div key={m.id} className="p-4 bg-white rounded-xl border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{m.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{m.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Target: {m.targetType} × {m.targetCount} | XP: {m.xpReward}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleMission(m.id, m.isActive)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {m.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => deleteMission(m.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}