"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Achievement {
  id: string;
  name: string;
  description: string;
  milestone: number;
  achievementType: string;
  iconUrl: string | null;
}

const defaultForm = {
  name: "",
  description: "",
  milestone: 1,
  achievementType: "reading_count",
  iconUrl: "",
};

export default function AdminAchievementsPage() {
  const { user, token } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    fetchAchievements();
  }, [user, token]);

  const fetchAchievements = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/achievements`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) setAchievements(await res.json());
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingId
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/achievements/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/achievements`;

    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          iconUrl: form.iconUrl.trim() || null,
        }),
      });

      if (res.ok) {
        cancelEdit();

        fetchAchievements();
      } else {
        alert("Gagal menyimpan achievement");
      }
    } catch {
      alert("Error");
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setForm({
      name: achievement.name,
      description: achievement.description || "",
      milestone: achievement.milestone,
      achievementType: achievement.achievementType || "reading_count",
      iconUrl: achievement.iconUrl || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus achievement ini?")) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/achievements/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    fetchAchievements();
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Kelola Achievement</h2>
        <button
          onClick={() => (showForm ? cancelEdit() : setShowForm(true))}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
        >
          {showForm ? "Batal" : "+ Tambah Achievement"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-white rounded-xl border space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Achievement
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Pembaca Pemula"
              required
              maxLength={100}
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
              placeholder="Selesaikan bacaan pertamamu"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <select
                value={form.achievementType}
                onChange={(e) =>
                  setForm({ ...form, achievementType: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="reading_count">Reading Count</option>
                <option value="quiz_perfect">Quiz Perfect</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Milestone
              </label>
              <input
                type="number"
                value={form.milestone}
                onChange={(e) =>
                  setForm({ ...form, milestone: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 border rounded-lg"
                min={1}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon URL</label>
              <input
                type="url"
                value={form.iconUrl}
                onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            {editingId ? "Update" : "Simpan"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : achievements.length === 0 ? (
        <p className="text-slate-500">Belum ada achievement.</p>
      ) : (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="p-4 bg-white rounded-xl border"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                      {achievement.achievementType}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Milestone: {achievement.milestone}
                    {achievement.iconUrl
                      ? ` | Icon: ${achievement.iconUrl}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(achievement)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(achievement.id)}
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
