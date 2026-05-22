"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import {
  AdminMissionDTO,
  apiRequest,
  apiRoutes,
  ClanRow,
  formatApiError,
  isApiError,
  ReadingDTO,
  SeasonDTO,
} from "@/lib/api";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({ readings: 0, missions: 0, clans: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSeason, setActiveSeason] = useState<SeasonDTO | null>(null);
  const [endingSeason, setEndingSeason] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchStats = async () => {
      try {
        const [readings, missions, clans, season] = await Promise.all([
          apiRequest<ReadingDTO[]>(apiRoutes.readings.list, { token }),
          apiRequest<AdminMissionDTO[]>(apiRoutes.admin.missions.list, {
            token,
          }),
          apiRequest<ClanRow[]>(apiRoutes.clans.list, { token }),
          apiRequest<SeasonDTO>(apiRoutes.admin.seasons.active, {
            token,
          }).catch((err) => {
            if (isApiError(err) && err.status === 404) return null;
            throw err;
          }),
        ]);
        setStats({
          readings: readings.length,
          missions: missions.length,
          clans: clans.length,
        });
        setActiveSeason(season);
      } catch (err) {
        showToast(formatApiError(err, "Gagal memuat statistik admin"), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, token]);

  const handleEndSeason = async () => {
    if (!activeSeason || endingSeason) return;
    if (
      !confirm(
        `Akhiri season "${activeSeason.name}"? Clan akan dipromosi/demoti sesuai ranking.`,
      )
    )
      return;

    setEndingSeason(true);
    try {
      await apiRequest(apiRoutes.admin.seasons.end(activeSeason.id), {
        method: "POST",
        token,
      });
      showToast("Season berhasil diakhiri!", "success");
      setActiveSeason(null);
    } catch (err) {
      showToast(formatApiError(err, "Gagal mengakhiri season"), "error");
    } finally {
      setEndingSeason(false);
    }
  };

  if (!user || user.role !== "admin") return null;

  const cards = [
    {
      label: "Bacaan",
      value: stats.readings || 0,
      href: "/admin/readings",
      color: "bg-blue-500",
    },
    {
      label: "Misi Harian",
      value: stats.missions || 0,
      href: "/admin/missions",
      color: "bg-green-500",
    },
    {
      label: "Clan",
      value: stats.clans || 0,
      href: "/admin/clans",
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Admin</h2>
      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              className="block p-6 bg-white rounded-xl border hover:border-slate-300 transition-colors"
            >
              <div
                className={`inline-block px-3 py-1 rounded text-white text-sm mb-2 ${card.color}`}
              >
                {card.label}
              </div>
              <p className="text-3xl font-bold">{card.value}</p>
            </a>
          ))}
        </div>
      )}

      {activeSeason && (
        <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
          <h3 className="font-semibold mb-2">Season Aktif</h3>
          <p className="text-lg">{activeSeason.name}</p>
          <button
            onClick={handleEndSeason}
            disabled={endingSeason}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {endingSeason ? "Mengakhiri..." : "Akhiri Season"}
          </button>
        </div>
      )}

      <div className="mt-8 p-6 bg-white rounded-xl border">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <a
            href="/admin/readings"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            + Tambah Bacaan
          </a>
          <a
            href="/admin/missions"
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            + Tambah Misi Harian
          </a>
        </div>
      </div>
    </div>
  );
}
