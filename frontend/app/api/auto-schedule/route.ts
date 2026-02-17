
import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { tournament_id, start_date, courts_count, match_duration, daily_start_hour } = await request.json();

        if (!tournament_id) {
            return NextResponse.json({ error: 'Missing tournament_id' }, { status: 400 });
        }

        // 0. Fetch Tournament Details (to get start_date)
        const { data: tournament, error: trnError } = await supabase
            .from('tournaments_mccarren_tournament')
            .select('start_date')
            .eq('id', tournament_id)
            .single();

        if (trnError || !tournament) {
            return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
        }

        // 1. Fetch Main Draw Bracket
        const { data: bracket, error: bracketError } = await supabase
            .from('brackets_mccarren_tournament')
            .select('id')
            .eq('tournament_id', tournament_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (bracketError || !bracket) {
            return NextResponse.json({ error: 'No bracket found for this tournament. Generate a draw first.' }, { status: 404 });
        }

        // 2. Fetch All Matches for this Bracket
        const { data: matches, error: matchesError } = await supabase
            .from('matches_mccarren_tournament')
            .select('*')
            .eq('bracket_id', bracket.id);

        if (matchesError || !matches || matches.length === 0) {
            return NextResponse.json({ error: 'No matches found to schedule.' }, { status: 400 });
        }

        // 3. Auto-Scheduling Logic - DYNAMIC CONFIG
        const DAILY_START_HOUR = daily_start_hour ? parseInt(daily_start_hour) : 9; // Default 9 AM
        const MATCH_DURATION_MINUTES = match_duration ? parseInt(match_duration) : 90;
        const NUM_COURTS = courts_count ? parseInt(courts_count) : 4;

        // Generate courts array
        const COURTS = Array.from({ length: NUM_COURTS }, (_, i) => `Court ${i + 1}`);

        // Helper
        const addDays = (date: Date, days: number) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

        const setTime = (date: Date, hours: number, minutes: number) => {
            const result = new Date(date);
            result.setHours(hours, minutes, 0, 0);
            return result;
        };

        // Use override date or tournament start date
        const tournamentStartDate = start_date ? new Date(start_date) : new Date(tournament.start_date || new Date());

        // Group matches by round for scheduling
        const matchesByRound: Record<number, any[]> = {};
        matches.forEach(m => {
            if (!matchesByRound[m.round_number]) matchesByRound[m.round_number] = [];
            matchesByRound[m.round_number].push(m);
        });

        const scheduledUpdates: { id: string, start_time: string, court: string }[] = [];

        Object.keys(matchesByRound).forEach(roundStr => {
            const round = parseInt(roundStr);
            const matchesInRound = matchesByRound[round];

            // Round 1 = Start Date, Round 2 = Start Date + 1, etc.
            const roundDate = addDays(tournamentStartDate, round - 1);

            let currentCOURTIndex = 0;
            let currentTime = setTime(roundDate, DAILY_START_HOUR, 0);

            // Sort matches in round by match number to keep order
            matchesInRound.sort((a, b) => a.match_number - b.match_number);

            matchesInRound.forEach(match => {
                // Only schedule matches that are pending/scheduled (ignored completed/bye)
                // Note: Logic allows rescheduling 'scheduled' status matches
                if (match.status === 'scheduled' || match.status === 'pending') {
                    const timeString = currentTime.toISOString();
                    const courtName = COURTS[currentCOURTIndex];

                    scheduledUpdates.push({
                        id: match.id,
                        start_time: timeString,
                        court: courtName
                    });

                    // Advance Court
                    currentCOURTIndex++;

                    // If we used all courts, advance time and reset courts
                    if (currentCOURTIndex >= COURTS.length) {
                        currentCOURTIndex = 0;
                        currentTime.setMinutes(currentTime.getMinutes() + MATCH_DURATION_MINUTES);
                    }
                }
            });
        });

        // 4. Update Matches in Database
        // Supabase upsert/update cannot easily do bulk update with different values for different IDs in one go 
        // without a custom function or looping.
        // For simplicity and matching current stack, we will loop parallel promises.
        // (For very large tournaments, a specific RPC or batched SQL would be better)

        const updatePromises = scheduledUpdates.map(update =>
            supabase
                .from('matches_mccarren_tournament')
                .update({ start_time: update.start_time, court: update.court })
                .eq('id', update.id)
        );

        await Promise.all(updatePromises);

        return NextResponse.json({ success: true, updated: scheduledUpdates.length }, { status: 200 });

    } catch (error: any) {
        console.error('API Route error FULL:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
