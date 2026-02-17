import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import MatchScheduler from '@/components/tournament/MatchScheduler';
import ScheduleActions from '@/components/tournament/ScheduleActions';

export default async function SchedulerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Bracket ID first
    const { data: bracket } = await supabase
        .from('brackets_mccarren_tournament')
        .select('id')
        .eq('tournament_id', id)
        .single();

    if (!bracket) {
        return <div className="p-8">No bracket found. Please generate the draw first.</div>;
    }

    // Fetch Matches
    const { data: matches } = await supabase
        .from('matches_mccarren_tournament')
        .select('*')
        .eq('bracket_id', bracket.id)
        .order('round_number', { ascending: true })
        .order('match_number_in_round', { ascending: true }); // Using our new/fixed column

    // Group by Round
    const rounds: Record<number, any[]> = {};
    matches?.forEach(m => {
        if (!rounds[m.round_number]) rounds[m.round_number] = [];
        rounds[m.round_number].push(m);
    });

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Link href={`/admin/tournaments/${id}`} className="text-gray-400 hover:text-tennis-navy mb-2 inline-block text-sm">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-tennis-navy">Match Scheduler</h1>
                    <p className="text-gray-500">Assign times and courts for the tournament.</p>
                </div>
                <div>
                    <ScheduleActions tournamentId={id} />
                </div>
            </div>

            <div className="space-y-12">
                {Object.keys(rounds).map((roundNum) => (
                    <div key={roundNum}>
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">
                            Round {roundNum}
                        </h2>
                        <div className="flex flex-col gap-4">
                            {rounds[parseInt(roundNum)].map(match => (
                                <MatchScheduler key={match.id} match={match} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
