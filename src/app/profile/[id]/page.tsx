'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface UserProfile {
  user: {
    id: string;
    username: string;
    displayName: string;
    role: string;
  };
  stats: {
    readingsCompleted: number;
    quizzesTaken: number;
    averageAccuracy: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    unlockedAt: string;
  }>;
  clan: {
    id: string;
    name: string;
    tier: string;
    role: string;
  } | null;
}

interface PageProps {
  params: { id: string };
}

export default function OtherUserProfilePage({ params }: PageProps) {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && authLoading) return;
    if (!mounted) return;
    if (!user) {
      router.push('/login');
    }
  }, [authLoading, mounted, user, router]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

  const userId = params.id;

  useEffect(() => {
    if (user && token) {
      setLoading(true);
      setError('');
      fetch(`${apiUrl}/api/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            if (res.status === 404) {
              throw new Error('User not found');
            }
            throw new Error('Failed to fetch profile');
          }
          return res.json();
        })
        .then(data => {
          setProfileData(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to fetch profile');
          setLoading(false);
        });
    }
  }, [user, token, apiUrl, userId]);

  useEffect(() => {
    if (mounted && authLoading) return;
    if (!mounted) return;
    if (!user) {
      router.push('/login');
    }
  }, [authLoading, mounted, user, router]);

  if (!mounted || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  if (!user) return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/clans');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-slate-500">Memuat profil...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              Kembali
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        <div className="bg-white rounded-xl border p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
              {profileData.user.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profileData.user.displayName}</h2>
              <p className="text-slate-500">@{profileData.user.username}</p>
              {profileData.user.role && (
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded capitalize">
                  {profileData.user.role}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Stats Card */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Statistik</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profileData.stats?.readingsCompleted || 0}</p>
                  <p className="text-sm text-slate-500">Bacaan</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profileData.stats?.quizzesTaken || 0}</p>
                  <p className="text-sm text-slate-500">Kuis</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.round((profileData.stats?.averageAccuracy || 0) * 100)}%</p>
                  <p className="text-sm text-slate-500">Akurasi</p>
                </div>
              </div>
            </div>

            {/* Achievements Card - only show visible achievements */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Achievements ({profileData.achievements?.filter((a: any) => a.visible !== false).length || 0})</h3>
              {profileData.achievements && profileData.achievements.filter((a: any) => a.visible !== false).length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {profileData.achievements.filter((a: any) => a.visible !== false).map((ach: any) => (
                    <div key={ach.id} className="p-3 bg-amber-50 rounded-lg">
                      <p className="font-medium text-amber-800">{ach.name}</p>
                      <p className="text-xs text-amber-600">
                        {new Date(ach.unlockedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Belum ada achievement</p>
              )}
            </div>

            {/* Clan Card */}
            {profileData.clan && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">Clan</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{profileData.clan.name}</p>
                    <p className="text-sm text-slate-500">Role: {profileData.clan.role}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    profileData.clan.tier === 'diamond' ? 'bg-purple-100 text-purple-700' :
                    profileData.clan.tier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                    profileData.clan.tier === 'silver' ? 'bg-gray-100 text-gray-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {profileData.clan.tier.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}