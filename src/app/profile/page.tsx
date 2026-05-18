'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
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
    visible: boolean;
  }>;
  clan: {
    id: string;
    name: string;
    tier: string;
    role: string;
  } | null;
}

export default function ProfilePage() {
  const { user, logout, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingVisibility, setIsEditingVisibility] = useState(false);
  const [togglingAchievementId, setTogglingAchievementId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const { showToast } = useToast();

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

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

  useEffect(() => {
    if (user && token) {
      fetch(`${apiUrl}/api/users/${user.id}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setProfileData(data))
      .catch(err => console.error('Failed to fetch profile:', err));
    }
  }, [user, token, apiUrl]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName(user?.displayName || '');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setIsSaving(true);

    try {
      const body: { displayName: string; password?: string; updatePassword?: boolean } = {
        displayName,
      };

      if (password) {
        body.password = password;
        body.updatePassword = true;
      }

      const res = await fetch(`${apiUrl}/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAchievementVisibility = async (achievementId: string, currentVisible: boolean) => {
    setTogglingAchievementId(achievementId);
    try {
      const res = await fetch(`${apiUrl}/api/achievements/${achievementId}/visibility?visible=${!currentVisible}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to toggle visibility');
      }

      // Update local state
      setProfileData(prev => prev ? {
        ...prev,
        achievements: prev.achievements.map(ach =>
          ach.id === achievementId ? { ...ach, visible: !currentVisible } : ach
        ),
      } : null);

      showToast('Achievement visibility updated', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update visibility', 'error');
    } finally {
      setTogglingAchievementId(null);
    }
  };

  if (!mounted || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="bg-white rounded-xl border p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                {displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold">{isEditing ? displayName : user.displayName}</h2>
                <p className="text-slate-500">@{user.username}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Stats Card */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Statistik</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profileData?.stats?.readingsCompleted || 0}</p>
                  <p className="text-sm text-slate-500">Bacaan</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profileData?.stats?.quizzesTaken || 0}</p>
                  <p className="text-sm text-slate-500">Kuis</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.round((profileData?.stats?.averageAccuracy || 0) * 100)}%</p>
                  <p className="text-sm text-slate-500">Akurasi</p>
                </div>
              </div>
            </div>

            {/* Achievements Card */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Achievements ({profileData?.achievements?.length || 0})</h3>
                {!isEditingVisibility && (
                  <button
                    onClick={() => setIsEditingVisibility(true)}
                    className="text-sm px-3 py-1 text-primary-600 hover:bg-primary-50 rounded-lg"
                  >
                    Edit Visibility
                  </button>
                )}
                {isEditingVisibility && (
                  <button
                    onClick={() => setIsEditingVisibility(false)}
                    className="text-sm px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Done
                  </button>
                )}
              </div>
              {profileData?.achievements && profileData.achievements.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {profileData.achievements.map((ach) => (
                    <div key={ach.id} className="p-3 bg-amber-50 rounded-lg flex items-start justify-between">
                      <div>
                        <p className="font-medium text-amber-800">{ach.name}</p>
                        <p className="text-xs text-amber-600">{new Date(ach.unlockedAt).toLocaleDateString('id-ID')}</p>
                      </div>
                      {isEditingVisibility && (
                        <button
                          onClick={() => handleToggleAchievementVisibility(ach.id, ach.visible)}
                          disabled={togglingAchievementId === ach.id}
                          className={`p-2 rounded-lg transition-colors ${
                            ach.visible
                              ? 'text-amber-600 hover:bg-amber-100'
                              : 'text-slate-400 hover:bg-slate-100'
                          } disabled:opacity-50`}
                          title={ach.visible ? 'Hide achievement' : 'Show achievement'}
                        >
                          {togglingAchievementId === ach.id ? (
                            <span className="text-xs">...</span>
                          ) : ach.visible ? (
                            <span>👁️</span>
                          ) : (
                            <span>👁️‍🗨️</span>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Belum ada achievement</p>
              )}
            </div>

            {/* Clan Card */}
            {profileData?.clan && (
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">Username</label>
              <p className="font-medium">{user.username}</p>
            </div>

            {isEditing ? (
              <>
                <div>
                  <label htmlFor="displayName" className="text-sm text-slate-500">Display Name</label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                <div className="pt-4 border-t space-y-4">
                  <p className="text-sm text-slate-500">Leave password fields empty to keep your current password</p>

                  <div>
                    <label htmlFor="password" className="text-sm text-slate-500">New Password</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="text-sm text-slate-500">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Confirm new password"
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    disabled={isSaving}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-slate-500">Display Name</label>
                  <p className="font-medium">{user.displayName}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Role</label>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}