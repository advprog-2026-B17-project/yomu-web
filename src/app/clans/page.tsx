"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import Header from "@/components/Header";
import {
  apiRequest,
  apiRoutes,
  ClanBuffsResponse,
  ClanRow,
  formatApiError,
  isApiError,
} from "@/lib/api";

export default function ClansPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [clans, setClans] = useState<ClanRow[]>([]);
  const [myClanId, setMyClanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedBuffs, setExpandedBuffs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchClanBuffs = async (
      clanId: string,
    ): Promise<ClanBuffsResponse | null> => {
      try {
        return await apiRequest<ClanBuffsResponse>(
          apiRoutes.clans.buffs(clanId),
          { token },
        );
      } catch (err) {
        console.error(formatApiError(err, "Failed to fetch clan buffs"));
      }
      return null;
    };

    const fetchClans = async () => {
      try {
        const data = await apiRequest<ClanRow[]>(apiRoutes.clans.list, {
          token,
        });
        const clansWithBuffs = await Promise.all(
          data.map(async (clan) => {
            if (Array.isArray(clan.buffs)) {
              return clan;
            }

            const buffsData = await fetchClanBuffs(clan.id);
            return { ...clan, buffs: buffsData?.buffs || [] };
          }),
        );
        setClans(clansWithBuffs);
      } catch (err) {
        if (isApiError(err) && err.status === 401) {
          showToast(formatApiError(err, "Session expired"), "error");
          router.push("/login");
        } else {
          showToast(formatApiError(err, "Gagal memuat clan"), "error");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchMyClan = async () => {
      try {
        const data = await apiRequest<ClanRow>(apiRoutes.clans.me, { token });
        setMyClanId(data.id);
      } catch (err) {
        if (isApiError(err) && err.status === 404) {
          setMyClanId(null);
          return;
        }
        console.error(formatApiError(err, "Failed to fetch my clan"));
      }
    };

    fetchClans();
    fetchMyClan();
  }, [user, token, isLoading, router, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  if (!user) return null;

  const handleJoin = async (clanId: string) => {
    if (actionLoading) return;
    setActionLoading(clanId);
    try {
      const data = await apiRequest<ClanRow | undefined>(
        apiRoutes.clans.join(clanId),
        { method: "POST", token },
      );
      setMyClanId(data?.id || clanId);
      showToast("Berhasil bergabung dengan clan!", "success");
      setTimeout(() => {
        router.push("/clans");
      }, 500);
    } catch (err) {
      showToast(formatApiError(err, "Gagal bergabung"), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (clanId: string) => {
    if (actionLoading) return;
    if (!confirm("Yakin ingin keluar dari clan ini?")) return;

    setActionLoading(clanId);
    try {
      await apiRequest(apiRoutes.clans.leave(clanId), {
        method: "POST",
        token,
      });
      setMyClanId(null);
      showToast("Berhasil keluar dari clan", "success");
      router.push("/clans");
    } catch (err) {
      showToast(formatApiError(err, "Gagal keluar clan"), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (clanId: string) => {
    if (actionLoading) return;
    if (!confirm("Yakin ingin menghapus clan ini? Semua anggota akan keluar."))
      return;

    setActionLoading(clanId);
    try {
      await apiRequest(apiRoutes.clans.delete(clanId), {
        method: "DELETE",
        token,
      });
      showToast("Clan berhasil dihapus", "success");
      router.push("/clans");
    } catch (err) {
      showToast(formatApiError(err, "Gagal menghapus clan"), "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Pilih Clan</h2>
          <Link
            href="/clans/create"
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
          >
            Buat Clan
          </Link>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            💡 Tips Buff
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>
              📈 <strong>Productivity Buff (x1.2):</strong> Aktif saat 50%+
              anggota selesaikan misi harian
            </li>
            <li>
              ⚠️ <strong>Low Accuracy Penalty (x0.8):</strong> Aktif saat
              rata-rata akurasi &lt;50%
            </li>
            <li>
              📈 <strong>Consistent Reader Buff (x1.1):</strong> Aktif saat
              rata-rata akurasi ≥80%
            </li>
            <li>
              ⚠️ <strong>Inactive Penalty (x0.9):</strong> Aktif saat &lt;30%
              anggota aktif dalam 3 hari
            </li>
          </ul>
        </div>

        {loading ? (
          <p className="text-slate-500">Memuat...</p>
        ) : clans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-slate-500">Belum ada clan. Buat clan pertama!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {clans.map((clan) => (
              <div key={clan.id} className="p-6 bg-white rounded-xl border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{clan.name}</h3>
                      <div
                        className="flex items-center gap-2"
                        title={
                          clan.willPromote
                            ? "Akan dipromosi jika season berakhir sekarang"
                            : clan.willDemote
                              ? "Akan didegradasi jika season berakhir sekarang"
                              : "Tier akan berubah di akhir season"
                        }
                      >
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            (clan.currentTier || clan.tier) === "diamond"
                              ? "bg-purple-100 text-purple-700"
                              : (clan.currentTier || clan.tier) === "gold"
                                ? "bg-yellow-100 text-yellow-700"
                                : (clan.currentTier || clan.tier) === "silver"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {(clan.currentTier || clan.tier).toUpperCase()}
                        </span>
                        {clan.willPromote && (
                          <span className="text-xs text-green-600 font-medium">
                            → {clan.previewTier?.toUpperCase()} ↑
                          </span>
                        )}
                        {clan.willDemote && (
                          <span className="text-xs text-red-600 font-medium">
                            → {clan.previewTier?.toUpperCase()} ↓
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Leader:{" "}
                      <Link
                        href={`/profile/${clan.leaderId}`}
                        className="hover:underline"
                      >
                        {clan.leaderName}
                      </Link>{" "}
                      • {clan.memberCount} anggota
                    </p>
                    <p className="text-sm text-slate-500">
                      Skor: {clan.totalScore.toFixed(0)}
                    </p>
                    {/* Buff Section - Hybrid Display */}
                    {clan.buffs && clan.buffs.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedBuffs);
                            if (newExpanded.has(clan.id)) {
                              newExpanded.delete(clan.id);
                            } else {
                              newExpanded.add(clan.id);
                            }
                            setExpandedBuffs(newExpanded);
                          }}
                          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                        >
                          📊 Buff Aktif: {clan.buffs.length} aktif [
                          {expandedBuffs.has(clan.id) ? "▲" : "▼"} Lihat detail]
                        </button>

                        {expandedBuffs.has(clan.id) && (
                          <div className="mt-1 pl-2 text-xs text-slate-500">
                            {clan.buffs.map((buff, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1"
                              >
                                {buff.multiplier > 1
                                  ? "📈"
                                  : buff.multiplier < 1
                                    ? "⚠️"
                                    : "📌"}{" "}
                                <span className="font-medium">
                                  {buff.buffType.replace(/_/g, " ")} (x
                                  {buff.multiplier})
                                </span>
                                {" - "}
                                {buff.description}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleJoin(clan.id)}
                      disabled={actionLoading !== null || myClanId !== null}
                      className="px-4 py-2 border border-primary-600 text-primary-600 text-sm rounded-lg hover:bg-primary-50 disabled:opacity-50"
                    >
                      {myClanId ? "Sudah Gabung" : "Gabung"}
                    </button>
                    {clan.leaderId === user.id && (
                      <button
                        onClick={() => handleDelete(clan.id)}
                        disabled={actionLoading !== null}
                        className="px-4 py-2 border border-red-500 text-red-500 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
