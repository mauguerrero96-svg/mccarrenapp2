'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabase/client';
import GenerateDrawButton from '../../components/OrganizerPanel/GenerateDrawButton';

interface Tournament {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function OrganizerPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    const { data, error } = await supabase
      .from('tournaments_mccarren_tournament')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTournaments(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'completed': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registration_open': return 'Registration Open';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status.replace('_', ' ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 mb-8 sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-slate-500 hover:text-emerald-700 flex items-center space-x-2 text-sm font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-emerald-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organizer Panel</h1>
                  <p className="text-sm text-slate-500 font-medium">Manage your tournaments</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/organizer/create-tournament"
                className="btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Tournament
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Tournaments</dt>
                <dd className="text-3xl font-bold text-slate-900 mt-1">{tournaments.length}</dd>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-l-sky-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Registration Open</dt>
                <dd className="text-3xl font-bold text-slate-900 mt-1">
                  {tournaments.filter(t => t.status === 'registration_open').length}
                </dd>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider">In Progress</dt>
                <dd className="text-3xl font-bold text-slate-900 mt-1">
                  {tournaments.filter(t => t.status === 'in_progress').length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Tournaments List */}
        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">My Tournaments</h3>
              <p className="text-sm text-slate-500">Manage all your tennis tournaments</p>
            </div>
            <div className="flex space-x-2">
              {/* Filters could go here */}
            </div>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-16 bg-white">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No tournaments yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">Get started by creating your first tournament. It only takes a minute.</p>
              <Link
                href="/organizer/create-tournament"
                className="btn-primary"
              >
                Create First Tournament
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="group hover:bg-slate-50 transition-colors duration-150">
                  <div className="px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center mb-1">
                          <h4 className="text-base font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                            {tournament.name}
                          </h4>
                          <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(tournament.status)}`}>
                            {getStatusText(tournament.status)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-slate-500 space-x-4">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(tournament.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(tournament.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Mccarren Park
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                        {tournament.status === 'registration_open' && (
                          <GenerateDrawButton
                            tournamentId={tournament.id}
                            tournamentName={tournament.name}
                            onDrawGenerated={loadTournaments}
                          />
                        )}
                        <Link
                          href={`/organizer/tournament/${tournament.id}`}
                          className="btn-secondary text-sm py-2 px-3"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}