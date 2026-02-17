'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client'; // Singleton
import MatchScoreModal from './MatchScoreModal';

interface Match {
    id: string;
    round_number: number;
    match_number: number;
    player1_id: string | null;
    player2_id: string | null;
    winner_id: string | null;
    score_text: string | null;
    status: string;
    next_match_id: string | null;
    // enriched fields (optional for now)
    player1_name?: string;
    player2_name?: string;
}

interface BracketViewProps {
    tournamentId: string;
    isAdmin?: boolean;
}

export default function BracketView({ tournamentId, isAdmin = false }: BracketViewProps) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [rounds, setRounds] = useState<Record<number, Match[]>>({});
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [seedingMode, setSeedingMode] = useState<'random' | 'standard'>('random');

    useEffect(() => {
        fetchBracket();
    }, [tournamentId]);

    const fetchBracket = async () => {
        // setLoading(true); // Don't wipe screen on re-fetch
        // Fetch matches... simplified for brevity, using same logic as before but robust
        // Actually, we need to find the bracket for this tournament first.
        const { data: bracketData } = await supabase
            .from('brackets_mccarren_tournament')
            .select('id')
            .eq('tournament_id', tournamentId)
            .single();

        if (bracketData) {
            const { data: mData } = await supabase
                .from('matches_mccarren_tournament')
                .select('*')
                .eq('bracket_id', bracketData.id)
                .order('round_number', { ascending: true })
                .order('match_number', { ascending: true });

            if (mData) {
                // Enrich matches with fallback names if not present
                const enrichedMatches = (mData as any[]).map(m => ({
                    ...m,
                    player1_name: m.player1_name || (m.player1_id ? `Player ${m.player1_id.substring(0, 4)}` : 'Bye'),
                    player2_name: m.player2_name || (m.player2_id ? `Player ${m.player2_id.substring(0, 4)}` : 'Bye')
                }));
                setMatches(enrichedMatches as Match[]);
                organizeRounds(enrichedMatches as Match[]);
            }
        }
        setLoading(false);
    };

    const organizeRounds = (matchList: Match[]) => {
        const grouped: Record<number, Match[]> = {};
        matchList.forEach(m => {
            if (!grouped[m.round_number]) grouped[m.round_number] = [];
            grouped[m.round_number].push(m);
        });
        setRounds(grouped);
    };

    const handleMatchUpdate = () => {
        fetchBracket();
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-600"></div>
            </div>
        );
    }

    if (matches.length === 0) return (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-slate-500 mb-6">No draw generated yet.</p>
            {isAdmin && (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Seeding Mode:</label>
                        <select
                            value={seedingMode}
                            onChange={(e) => setSeedingMode(e.target.value as 'random' | 'standard')}
                            className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-tennis-accent focus:border-tennis-accent text-slate-700"
                        >
                            <option value="random">Random Shuffle</option>
                            <option value="standard">Standard (Ranked)</option>
                        </select>
                    </div>
                    <button
                        onClick={async () => {
                            setLoading(true);
                            const res = await fetch('/api/generate-draw', {
                                method: 'POST',
                                body: JSON.stringify({ tournament_id: tournamentId, seeding_mode: seedingMode })
                            });
                            if (res.ok) {
                                fetchBracket();
                            } else {
                                setLoading(false);
                                alert('Failed to generate draw');
                            }
                        }}
                        className="btn-primary flex items-center gap-2"
                    >
                        Generate Draw
                    </button>
                </div>
            )}
        </div>
    );

    // Calculate container height based on Round 1 (biggest round)
    const round1Count = rounds[1]?.length || 0;
    // Estimate: 140px per card + spacing. strictly enforce this min-height.
    const containerHeight = Math.max(600, round1Count * 140);

    return (
        <div className="w-full overflow-x-auto bg-slate-50/50 p-6 rounded-xl border border-slate-100" style={{ minHeight: containerHeight + 100 }}>
            <div className="flex gap-0 min-w-max h-full" style={{ height: containerHeight }}>
                {Object.keys(rounds).map((roundNumStr, roundIndex) => {
                    const roundNum = parseInt(roundNumStr);
                    const roundMatches = rounds[roundNum];
                    const isFinal = roundNum === Math.max(...Object.keys(rounds).map(Number));

                    return (
                        <div key={roundNum} className="flex flex-col justify-around min-w-[320px] relative px-8">
                            {/* Round Header */}
                            <div className="absolute top-[-40px] left-0 w-full text-center">
                                <h3 className="text-xs font-black text-tennis-navy-700/50 uppercase tracking-[0.2em]">
                                    {isFinal ? '🏆 Final' : `Round ${roundNum}`}
                                </h3>
                            </div>

                            {roundMatches.map((match, idx) => (
                                <div key={match.id} className="relative flex items-center w-full">
                                    <MatchCard
                                        match={match}
                                        isAdmin={isAdmin}
                                        onEdit={() => setSelectedMatch(match)}
                                    />

                                    {/* Connectors (CSS Magic) */}
                                    {!isFinal && (
                                        <>
                                            {/* Horizontal Line out - using slate-300 */}
                                            <div className="absolute right-[-32px] w-8 border-b-2 border-slate-300 top-1/2" />

                                            {/* Vertical Connectors (Only on even/odd pairs) */}
                                            {idx % 2 === 0 && (
                                                <div className="absolute right-[-32px] w-0 border-r-2 border-slate-300 top-1/2 h-[calc(50%+100%)]"
                                                    style={{ height: `${containerHeight / rounds[roundNum].length}px` }}
                                                />
                                            )}
                                        </>
                                    )}
                                    {/* Incoming line for rounds > 1 */}
                                    {roundNum > 1 && (
                                        <div className="absolute left-[-32px] w-8 border-b-2 border-slate-300 top-1/2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Score Modal */}
            {selectedMatch && (
                <MatchScoreModal
                    isOpen={!!selectedMatch}
                    match={selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                    onUpdate={handleMatchUpdate}
                />
            )}
        </div>
    );
}

function MatchCard({ match, isAdmin, onEdit }: { match: Match; isAdmin: boolean; onEdit?: () => void }) {
    const p1Winner = match.winner_id && match.winner_id === match.player1_id;
    const p2Winner = match.winner_id && match.winner_id === match.player2_id;
    const isCompleted = match.status === 'completed';
    const isLive = match.status === 'in_progress';

    return (
        <div className="relative w-full group perspective-1000">
            <div className={`
                relative flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 
                transition-all duration-300 ease-out
                hover:shadow-lg hover:-translate-y-1 hover:border-tennis-green-200
                overflow-hidden z-10
                ${isLive ? 'ring-2 ring-court-clay' : ''}
            `}>
                {/* Header / Status Bar - vertical strip on left */}
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-tennis-green-500 transition-colors" />

                <div className="flex flex-col">
                    {/* Player 1 */}
                    <PlayerRow
                        id={match.player1_id}
                        name={match.player1_name || 'TBD'}
                        isWinner={p1Winner}
                        score={p1Winner && match.score_text ? match.score_text : ''}
                        placeholder="Top Seed"
                    />

                    {/* Divider */}
                    <div className="h-px bg-slate-100 w-full mx-auto" />

                    {/* Player 2 */}
                    <PlayerRow
                        id={match.player2_id}
                        name={match.player2_name || 'TBD'}
                        isWinner={p2Winner}
                        score={p2Winner && match.score_text ? match.score_text : ''}
                        placeholder="Challenger"
                    />
                </div>

                {/* Meta Info (Match Num) */}
                <div className="absolute top-2 right-2 flex gap-1">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">#{match.match_number}</span>
                    {isLive && <span className="text-[10px] font-bold text-court-clay uppercase tracking-wider animate-pulse">LIVE</span>}
                </div>

                {/* Edit Action */}
                {isAdmin && match.status !== 'bye' && (
                    <div className="absolute inset-0 bg-tennis-navy-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] cursor-pointer" onClick={onEdit}>
                        <div className="bg-white text-tennis-navy-700 px-4 py-2 rounded-full font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-transform flex items-center gap-2 text-sm">
                            <span>Edit Result</span>
                            <span className="text-tennis-green-500">✏️</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function PlayerRow({ id, name, isWinner, score, placeholder }: { id: string | null, name: string, isWinner: boolean | null, score: string, placeholder: string }) {
    return (
        <div className={`
            flex items-center justify-between p-4 h-14 transition-colors
            ${isWinner ? 'bg-tennis-green-50/50' : ''}
            ${!id ? 'opacity-50' : ''}
        `}>
            <div className="flex items-center gap-3">
                {/* Simple Avatar/Seed Indicator */}
                <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-inner
                    ${id ? (isWinner ? 'bg-tennis-green-500 text-white' : 'bg-slate-100 text-slate-500') : 'bg-slate-50 text-slate-300'}
                `}>
                    {id ? name.charAt(0).toUpperCase() : '?'}
                </div>

                <div className="flex flex-col leading-none">
                    <span className={`text-sm font-semibold truncate max-w-[140px] ${isWinner ? 'text-tennis-navy-900' : 'text-slate-600'}`}>
                        {id ? name : placeholder}
                        {isWinner && <span className="ml-2 text-tennis-green-600">✓</span>}
                    </span>
                    {id && <span className="text-[10px] text-slate-400 font-medium">Rank {id.slice(0, 2)}..</span>}
                </div>
            </div>

            {/* Score */}
            <div className="font-mono font-bold text-sm text-slate-900">
                {score || '-'}
            </div>
        </div>
    );
}
