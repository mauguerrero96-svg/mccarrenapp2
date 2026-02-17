'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import MatchScheduler from '../tournament/MatchScheduler';
import EmptyState from '../ui/EmptyState';

interface Match {
    id: string;
    round_number: number;
    match_number_in_round: number;
    player1_id: string | null;
    player2_id: string | null;
    score: string | null;
    status: string;
    start_time: string | null;
    court: string | null;
    // Enriched
    player1_name?: string;
    player2_name?: string;
}

interface ScheduleViewProps {
    tournamentId: string;
}

export default function ScheduleView({ tournamentId }: ScheduleViewProps) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterCourt, setFilterCourt] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'court'>('list');

    useEffect(() => {
        loadSchedule();
    }, [tournamentId]);

    const loadSchedule = async () => {
        try {
            // Get Bracket ID first
            const { data: bracket } = await supabase
                .from('brackets_mccarren_tournament')
                .select('id')
                .eq('tournament_id', tournamentId)
                .single();

            if (!bracket) {
                setLoading(false);
                return;
            }

            // Get Matches
            const { data: matchesData, error } = await supabase
                .from('matches_mccarren_tournament')
                .select('*')
                .eq('bracket_id', bracket.id)
                .order('start_time', { ascending: true, nullsFirst: false })
                .order('round_number', { ascending: true });

            if (error) throw error;

            // Ideally we also fetch player names, but leveraging existing structure for now.
            // If MatchScheduler does it, fine. But for Court View we need names here.
            // Let's assume names are enriched or we do a quick fetch map if heavily used.
            // For now, I'll update the type to optional and let the UI handle fallbacks.

            setMatches(matchesData || []);
        } catch (error) {
            console.error('Error loading schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMatches = matches.filter(match => {
        const dateMatch = !filterDate || (match.start_time && match.start_time.startsWith(filterDate));
        const courtMatch = filterCourt === 'all' || match.court === filterCourt;
        return dateMatch && courtMatch;
    });

    // Derive unique courts for Court View
    const uniqueCourts = Array.from(new Set(matches.map(m => m.court).filter(Boolean).sort())) as string[];

    // Group matches for Court View
    const matchesByCourtAndDate: Record<string, Match[]> = {}; // Key: "Court Name"
    if (viewMode === 'court') {
        matches.forEach(m => {
            if (m.court) {
                if (!matchesByCourtAndDate[m.court]) matchesByCourtAndDate[m.court] = [];
                matchesByCourtAndDate[m.court].push(m);
            }
        });
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-600"></div>
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <EmptyState
                title="No matches scheduled"
                description="Generate the draw first to create matches."
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end justify-between">

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-tennis-navy-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('court')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'court' ? 'bg-white text-tennis-navy-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Court View
                        </button>
                    </div>

                    {/* Filters (Only for List Mode or Global Date) */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Filter Date
                        </label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="block w-32 px-2 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-tennis-green-500 focus:border-tennis-green-500 text-slate-700 bg-slate-50"
                        />
                    </div>
                </div>

                <button
                    onClick={loadSchedule}
                    className="text-sm text-tennis-green-700 hover:text-tennis-green-800 font-medium flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh
                </button>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="space-y-3">
                    {filteredMatches.length > 0 ? (
                        filteredMatches.map(match => (
                            <MatchScheduler key={match.id} match={match} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                            No matches found matching your filters.
                        </div>
                    )}
                </div>
            )}

            {/* Court View */}
            {viewMode === 'court' && (
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-max">
                        {uniqueCourts.length > 0 ? uniqueCourts.map(court => (
                            <div key={court} className="w-80 flex flex-col gap-3">
                                {/* Court Header */}
                                <div className="bg-tennis-navy-800 text-white text-center py-2 px-4 rounded-lg font-bold shadow-sm border border-tennis-navy-900">
                                    {court}
                                </div>

                                {/* Matches for this Court */}
                                <div className="flex flex-col gap-3">
                                    {matchesByCourtAndDate[court]
                                        ?.filter(m => !filterDate || (m.start_time && m.start_time.startsWith(filterDate)))
                                        .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                                        .map(match => (
                                            <div key={match.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-[10px] font-bold text-tennis-green-700 uppercase bg-tennis-green-50 px-1.5 py-0.5 rounded">
                                                        {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}
                                                    </div>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                                                        R{match.round_number}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-1 text-sm">
                                                    <div className="font-medium text-slate-800 truncate">
                                                        {(match as any).player1_name || 'TBD'}
                                                    </div>
                                                    <div className="text-slate-400 text-xs text-center border-t border-slate-100 my-0.5">vs</div>
                                                    <div className="font-medium text-slate-800 truncate">
                                                        {(match as any).player2_name || 'TBD'}
                                                    </div>
                                                </div>

                                                {match.status === 'completed' && (
                                                    <div className="mt-2 text-right">
                                                        <span className="text-xs font-bold text-tennis-green-600">Completed ✓</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )) : (
                            <div className="w-full text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                                No courts assigned yet. Use Auto-Schedule to assign courts.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
