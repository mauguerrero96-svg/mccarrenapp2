'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface DashboardData {
  stats: {
    totalMatches: number;
    matchesWon: number;
    winRate: number;
    tournamentsPlayed: number;
  };
  nextMatch: {
    id: string;
    tournamentName: string;
    round: string;
    startTime: string;
    court: string;
    opponentId: string;
    opponentName: string;
  } | null;
  activeTournaments: {
    id: string;
    name: string;
    status: string;
    startDate: string;
    userStatus: string;
  }[];
  userRole: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const loadDashboard = async () => {
    try {
      const res = await fetch('/api/player/dashboard');
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Ensure userRole is strictly checked
  const { stats, nextMatch, activeTournaments = [], userRole } = data || {};
  const isAdmin = userRole && ['admin', 'organizer', 'developer'].includes(userRole);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-tennis-navy-900 tracking-tight">
              Player Dashboard
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Welcome back to Mccarren Tennis. Here is your activity overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button href="/tournaments" variant="secondary">Browse Tournaments</Button>
            <Button href="/profile">My Profile</Button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card padding="sm" className="bg-white border-none shadow-sm ring-1 ring-slate-200">
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-1">Matches Played</div>
            <div className="text-3xl font-bold text-tennis-navy-900">{stats?.totalMatches || 0}</div>
          </Card>
          <Card padding="sm" className="bg-white border-none shadow-sm ring-1 ring-slate-200">
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-1">Matches Won</div>
            <div className="text-3xl font-bold text-tennis-green-600">{stats?.matchesWon || 0}</div>
          </Card>
          <Card padding="sm" className="bg-white border-none shadow-sm ring-1 ring-slate-200">
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-1">Win Rate</div>
            <div className="text-3xl font-bold text-tennis-navy-900">{stats?.winRate || 0}%</div>
          </Card>
          <Card padding="sm" className="bg-white border-none shadow-sm ring-1 ring-slate-200">
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-1">Active Events</div>
            <div className="text-3xl font-bold text-tennis-navy-900">{stats?.tournamentsPlayed || 0}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column (Left - 2cols) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Next Match Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-tennis-green-500 to-tennis-accent-500"></div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-tennis-navy-900 flex items-center gap-2">
                    <span className="text-2xl">🎾</span> Next Match
                  </h2>
                  {nextMatch && (
                    <span className="px-3 py-1 bg-tennis-orange-50 text-tennis-orange-700 text-xs font-bold uppercase tracking-wider rounded-full ring-1 ring-tennis-orange-200">
                      Upcoming
                    </span>
                  )}
                </div>

                {nextMatch ? (
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          {nextMatch.tournamentName} • {nextMatch.round}
                        </p>
                        <div className="text-3xl font-bold text-tennis-navy-900 mb-2">
                          {new Date(nextMatch.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-4 text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span>📅</span>
                            <span className="font-medium">{new Date(nextMatch.startTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>📍</span>
                            <span className="font-medium text-tennis-green-700">{nextMatch.court}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 min-w-[200px] bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl">
                          👤
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Opponent</p>
                          <p className="text-base font-bold text-slate-900">{nextMatch.opponentName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">No upcoming matches scheduled.</p>
                    <p className="text-slate-400 text-sm mt-1">Check back later or view your tournament schedules.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Tournaments */}
            <div>
              <h2 className="text-xl font-bold text-tennis-navy-900 mb-4 flex items-center gap-2">
                <span>🏆</span> My Tournaments
              </h2>

              <div className="grid gap-4">
                {activeTournaments.length > 0 ? (
                  activeTournaments.map(tournament => (
                    <Card key={tournament.id} padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                      <div>
                        <h3 className="font-bold text-lg text-tennis-navy-900">{tournament.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${tournament.status === 'in_progress' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {tournament.status.replace('_', ' ')}
                          </span>
                          <span>Started {new Date(tournament.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button href={`/organizer/tournament/${tournament.id}?tab=draws`} variant="secondary">
                          View Draw
                        </Button>
                        <Button href={`/organizer/tournament/${tournament.id}?tab=schedule`} variant="primary">
                          Schedule
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card padding="lg" className="text-center">
                    <p className="text-slate-500 mb-4">You are not registered for any active tournaments.</p>
                    <Link href="/tournaments" className="text-tennis-green-600 font-bold hover:underline">
                      Browse Available Tournaments
                    </Link>
                  </Card>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar (Right - 1col) */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <Card padding="md">
              <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/tournaments" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-tennis-green-50 group transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-lg">🔍</span>
                    <span className="font-medium text-slate-700 group-hover:text-tennis-navy-900">Find Tournaments</span>
                  </div>
                  <span className="text-slate-400 group-hover:text-tennis-green-600">→</span>
                </Link>
                <Link href="/profile" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-tennis-green-50 group transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-lg">👤</span>
                    <span className="font-medium text-slate-700 group-hover:text-tennis-navy-900">My Profile</span>
                  </div>
                  <span className="text-slate-400 group-hover:text-tennis-green-600">→</span>
                </Link>
              </div>
            </Card>

            {/* Admin Link (Only visible if admin/organizer) */}
            {isAdmin && (
              <div className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                </div>
                <h3 className="font-bold text-lg mb-2 relative z-10">Organizer Access</h3>
                <p className="text-slate-400 text-sm mb-4 relative z-10">Manage tournaments, schedules, and players.</p>
                <Link href="/admin" className="inline-block w-full text-center py-2 bg-tennis-green-600 hover:bg-tennis-green-500 text-white rounded-lg font-bold transition-colors relative z-10 shadow-md">
                  Go to Admin Dashboard
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}