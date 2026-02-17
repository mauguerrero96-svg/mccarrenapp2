'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Skeleton from '../../components/ui/Skeleton';

interface Stats {
  totalUsers: number;
  totalTournaments: number;
  activeTournaments: number;
  totalClubs: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTournaments: 0,
    activeTournaments: 0,
    totalClubs: 0,
  });
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, tournamentsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/recent-tournaments')
      ]);

      const statsData = await statsRes.json();
      const tournamentsData = await tournamentsRes.json();

      if (statsRes.ok) {
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalTournaments: statsData.totalTournaments || 0,
          activeTournaments: statsData.activeTournaments || 0,
          totalClubs: statsData.totalClubs || 0,
        });
      }

      if (tournamentsRes.ok) {
        // TEMPORARY: Filter to only show "Torneo Master 32"
        const allTournaments = tournamentsData.tournaments || [];
        const filtered = allTournaments.filter((t: any) => t.name === 'Torneo Master 32');
        setRecentTournaments(filtered);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Active Tournaments',
      value: stats.activeTournaments,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Total Players',
      value: stats.totalUsers, // approximates players
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="200px" height="32px" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="rectangular" width="100%" height="100px" />
          <Skeleton variant="rectangular" width="100%" height="100px" />
        </div>
        <Skeleton variant="text" width="150px" height="24px" className="mt-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="rectangular" width="100%" height="200px" />
          <Skeleton variant="rectangular" width="100%" height="200px" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tennis-navy-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, Director.</p>
        </div>
        <div className="flex gap-4">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.iconColor}`}>
                {card.icon}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">{card.label}</div>
                <div className="text-xl font-bold text-slate-800">{card.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Tournaments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-tennis-navy-800 flex items-center gap-2">
            <span className="text-2xl">🏆</span> Active Tournaments
          </h2>
          <a href="/admin/tournaments" className="text-sm font-medium text-tennis-green-700 hover:text-tennis-green-800">
            View All &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {recentTournaments.map(tournament => (
            <div key={tournament.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{tournament.name}</h3>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <span>📅 {new Date(tournament.start_date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>👥 {tournament.player_count || 0} Players</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                            ${tournament.status === 'registration_open' ? 'bg-green-100 text-green-700' :
                    tournament.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'}`}>
                  {tournament.status.replace('_', ' ')}
                </span>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {/* Manage Players */}
                <a href={`/organizer/tournament/${tournament.id}?tab=players`}
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors group">
                  <span className="text-xl group-hover:scale-110 transition-transform">👥</span>
                  <span className="text-xs font-semibold text-slate-600">Players</span>
                </a>

                {/* Draw */}
                <a href={`/organizer/tournament/${tournament.id}?tab=draws`}
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-slate-50 hover:bg-tennis-green-50 border border-slate-100 hover:border-tennis-green-100 transition-colors group">
                  <span className="text-xl group-hover:scale-110 transition-transform">⚔️</span>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-tennis-green-700">Draw</span>
                </a>

                {/* Schedule */}
                <a href={`/organizer/tournament/${tournament.id}?tab=schedule`}
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-slate-50 hover:bg-tennis-accent-50 border border-slate-100 hover:border-tennis-accent-100 transition-colors group">
                  <span className="text-xl group-hover:scale-110 transition-transform">📅</span>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-tennis-accent-700">Schedule</span>
                </a>

                {/* Settings */}
                <a href={`/admin/tournaments/${tournament.id}`}
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors group">
                  <span className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
                  <span className="text-xs font-semibold text-slate-600">Settings</span>
                </a>
              </div>
            </div>
          ))}

          {recentTournaments.length === 0 && (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 mb-4">No tournaments found.</p>
              <a href="/admin/tournaments/new" className="inline-flex items-center px-4 py-2 bg-tennis-green-600 text-white rounded-lg font-medium hover:bg-tennis-green-700">
                Create Tournament
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
