"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { apiRequest, apiRoutes, formatApiError, ReadingDTO } from "@/lib/api";

export default function AdminReadingsPage() {
  const { user, token } = useAuth();
  const [readings, setReadings] = useState<ReadingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "News & Media",
  });
  const [categoryInput, setCategoryInput] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetchReadings();
  }, [user, token]);

  const fetchReadings = async () => {
    try {
      const data = await apiRequest<ReadingDTO[]>(apiRoutes.readings.list, {
        token,
      });
      setReadings(data);
    } catch (err) {
      alert(formatApiError(err, "Gagal memuat bacaan"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest(apiRoutes.readings.list, {
        method: "POST",
        token,
        body: { ...form, categoryName: form.category },
      });
      setShowForm(false);
      setForm({ title: "", content: "", category: "News & Media" });
      fetchReadings();
    } catch (err) {
      alert(formatApiError(err, "Gagal membuat bacaan"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus bacaan ini?")) return;

    try {
      await apiRequest(apiRoutes.readings.byId(id), {
        method: "DELETE",
        token,
      });
      fetchReadings();
    } catch (err) {
      alert(formatApiError(err, "Gagal menghapus bacaan"));
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Kelola Bacaan</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Batal" : "+ Tambah Bacaan"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-6 bg-white rounded-xl border space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value);
                setForm({ ...form, category: e.target.value });
              }}
              placeholder="News & Media, Olahraga, dll"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Konten</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg h-48"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Simpan
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : readings.length === 0 ? (
        <p className="text-slate-500">Belum ada bacaan.</p>
      ) : (
        <div className="space-y-4">
          {readings.map((r) => (
            <div key={r.id} className="p-4 bg-white rounded-xl border">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {r.category?.name || "Tanpa kategori"}
                  </span>
                  <h3 className="font-semibold mt-1">
                    <Link
                      href={`/admin/readings/${r.id}`}
                      className="hover:underline"
                    >
                      {r.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {r.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
