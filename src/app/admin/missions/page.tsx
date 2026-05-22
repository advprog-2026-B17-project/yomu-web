"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  AdminMissionDTO,
  apiRequest,
  apiRoutes,
  formatApiError,
} from "@/lib/api";

export default function AdminMissionsPage() {
  const { user, token } = useAuth();
  const [missions, setMissions] = useState<AdminMissionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    targetType: "reading",
    targetCount: 3,
    xpReward: 10,
  });

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetchMissions();
  }, [user, token]);

  const fetchMissions = async () => {
    try {
      const data = await apiRequest<AdminMissionDTO[]>(
        apiRoutes.admin.missions.list,
        { token },
      );
      setMissions(data);
    } catch (err) {
      alert(formatApiError(err, "Gagal memuat misi"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest(apiRoutes.admin.missions.list, {
        method: "POST",
        token,
        body: form,
      });
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        targetType: "reading",
        targetCount: 3,
        xpReward: 10,
      });
      fetchMissions();
    } catch (err) {
      alert(formatApiError(err, "Gagal menyimpan misi"));
    }
  };

  const toggleMission = async (id: string, active: boolean) => {
    try {
      await apiRequest(
        `${apiRoutes.admin.missions.toggle(id)}?active=${!active}`,
        {
          method: "PATCH",
          token,
        },
      );
      fetchMissions();
    } catch (err) {
      alert(formatApiError(err, "Gagal mengubah status misi"));
    }
  };

  const deleteMission = async (id: string) => {
    if (confirm("Hapus misi ini?")) {
      try {
        await apiRequest(apiRoutes.admin.missions.byId(id), {
          method: "DELETE",
          token,
        });
        fetchMissions();
      } catch (err) {
        alert(formatApiError(err, "Gagal menghapus misi"));
      }
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Kelola Misi Harian</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
        >
          {showForm ? "Batal" : "+ Tambah Misi"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-6 bg-white rounded-xl border space-y-4"
        >
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
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Target Type
              </label>
              <select
                value={form.targetType}
                onChange={(e) =>
                  setForm({ ...form, targetType: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="reading">Reading</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Target Count
              </label>
              <input
                type="number"
                value={form.targetCount}
                onChange={(e) =>
                  setForm({ ...form, targetCount: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                XP Reward
              </label>
              <input
                type="number"
                value={form.xpReward}
                onChange={(e) =>
                  setForm({ ...form, xpReward: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg"
                min={1}
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
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
          {missions.map((m) => {
            const active = m.isActive ?? m.active ?? false;

            return (
              <div key={m.id} className="p-4 bg-white rounded-xl border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{m.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {m.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Target: {m.targetType} × {m.targetCount} | XP:{" "}
                      {m.xpReward}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleMission(m.id, active)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {active ? "Nonaktifkan" : "Aktifkan"}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
