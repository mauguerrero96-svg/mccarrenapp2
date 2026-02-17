'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../utils/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import GenerateDrawButton from '../../../../components/OrganizerPanel/GenerateDrawButton';
import AutoScheduleButton from '../../../../components/OrganizerPanel/AutoScheduleButton';
import BracketView from '../../../../components/tournament/BracketView';
import PlayersList from '../../../../components/OrganizerPanel/PlayersList';
import ScheduleView from '../../../../components/OrganizerPanel/ScheduleView';

interface Tournament {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
    clubs_mccarren_tournament?: {
        name: string;
    };
}

type Tab = 'overview' | 'players' | 'draws' | 'schedule';

export default function TournamentDetailPage() {
    const params = useParams();
    const tournamentId = params.id as string;
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    useEffect(() => {
        loadTournament();
    }, [tournamentId]);

    const loadTournament = async () => {
        const { data, error } = await supabase
            .from('tournaments_mccarren_tournament')
            .select(`
        *,
        clubs_mccarren_tournament (
          name
        )
      `)
            .eq('id', tournamentId)
            .single();

        if (!error && data) {
            setTournament(data);
        }
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'registration_open': return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200';
            case 'in_progress': return 'bg-sky-100 text-sky-800 ring-1 ring-sky-200';
            case 'completed': return 'bg-slate-100 text-slate-800 ring-1 ring-slate-200';
            default: return 'bg-amber-100 text-amber-800 ring-1 ring-amber-200';
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading tournament...</p>
                </div>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-xl text-slate-800 font-semibold">Tournament not found</p>
                    <Link href="/organizer" className="text-tennis-green-600 hover:text-tennis-green-700 font-medium mt-4 block">
                        &larr; Back to Organizer Panel
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 mb-8 sticky top-0 z-10 backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                                <Link href="/organizer" className="text-slate-500 hover:text-tennis-green-700 flex items-center space-x-2 text-sm font-medium transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span className="hidden sm:inline">Back</span>
                                </Link>
                                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                                <div>
                                    <h1 className="text-2xl font-bold text-tennis-navy-900 tracking-tight">{tournament.name}</h1>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm text-slate-500 font-medium flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {tournament.clubs_mccarren_tournament?.name || 'No Club Assigned'}
                                        </span>
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(tournament.status)}`}>
                                            {getStatusText(tournament.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3">
                                {(tournament.status === 'registration_open' || tournament.status === 'in_progress') && (
                                    <>
                                        {/* Only allow Draw Creation if status is open/progress (maybe allow regen) */}
                                        <GenerateDrawButton
                                            tournamentId={tournament.id}
                                            tournamentName={tournament.name}
                                            onDrawGenerated={loadTournament}
                                        />

                                        {/* Auto Schedule Button - mainly useful if matches exist (which they do if status is in_progress) */}
                                        <AutoScheduleButton
                                            tournamentId={tournament.id}
                                            onScheduleComplete={loadTournament}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex items-center space-x-8 mt-8 border-b border-slate-100">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'players', label: 'Players' },
                                { id: 'draws', label: 'Draws' },
                                { id: 'schedule', label: 'Schedule' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`
                                        pb-4 text-sm font-medium border-b-2 transition-colors
                                        ${activeTab === tab.id
                                            ? 'border-tennis-green-600 text-tennis-green-800'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Tournament Info Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-base font-semibold text-tennis-navy-900">Tournament Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div>
                                        <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date Range</dt>
                                        <dd className="text-sm font-medium text-slate-900 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'TBD'} - {tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : 'TBD'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Format</dt>
                                        <dd className="text-sm font-medium text-slate-900 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            Single Elimination
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Stats Placeholder */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-tennis-navy-800 to-tennis-navy-900 rounded-xl p-6 text-white shadow-md">
                                <h3 className="text-lg font-bold opacity-90">Quick Management</h3>
                                <p className="text-tennis-navy-100 text-sm mt-1 mb-4">Manage players and schedule effectively.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setActiveTab('players')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                                        View Players
                                    </button>
                                    <button onClick={() => setActiveTab('schedule')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                                        Manage Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'players' && (
                    <div className="animate-fadeIn">
                        <PlayersList tournamentId={tournament.id} />
                    </div>
                )}

                {activeTab === 'draws' && (
                    <div className="animate-fadeIn space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-tennis-navy-900">Tournament Draw</h2>
                            {/* Generate button is also in header, but good to have context here if empty */}
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1 overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <BracketView tournamentId={tournament.id} isAdmin={true} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-tennis-navy-900">Match Schedule</h2>
                        </div>
                        <ScheduleView tournamentId={tournament.id} />
                    </div>
                )}

            </main>
        </div>
    );
}
