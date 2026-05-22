"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  AchievementRow,
  apiRequest,
  apiRoutes,
  formatApiError,
  isApiError,
} from "@/lib/api";

export default function AchievementsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [achievements, setAchievements] = useState<AchievementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchAchievements = async () => {
      setError("");
      try {
        const data = await apiRequest<AchievementRow[]>(
          apiRoutes.achievements.byUser(user.id),
          { token },
        );
        setAchievements(data);
      } catch (err) {
        if (isApiError(err) && err.status === 401) {
          router.push("/login");
        }
        setError(formatApiError(err, "Gagal memuat achievement"));
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user, token, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Achievements</h2>
        {loading ? (
          <p className="text-slate-500">Memuat...</p>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-slate-500">Belum ada achievement.</p>
            <p className="text-sm text-slate-400 mt-2">
              Selesaikan bacaan untuk membuka achievement!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((ach) => {
              const isUnlocked = ach.unlocked;
              return (
                <div
                  key={ach.id}
                  className={`p-4 bg-white rounded-xl border flex items-center gap-4 ${
                    isUnlocked ? "" : "opacity-50"
                  }`}
                >
                  <div className="text-4xl">{isUnlocked ? "🏆" : "🔒"}</div>
                  <div>
                    <h3 className="font-semibold">{ach.name}</h3>
                    <p className="text-sm text-slate-500">
                      {ach.description || `Milestone: ${ach.milestone}`}
                    </p>
                    {ach.unlockedAt && (
                      <p className="text-xs text-slate-400 mt-1">
                        Di-unlock:{" "}
                        {new Date(ach.unlockedAt).toLocaleDateString("id-ID")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
