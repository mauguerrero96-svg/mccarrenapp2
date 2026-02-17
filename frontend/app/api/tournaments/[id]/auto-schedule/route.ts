import { NextResponse } from 'next/server';
import { createClient } from '../../../../../utils/supabase/server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Correct params typing for Next.js 15+
) {
    try {
        const { id: tournament_id } = await params;
        const supabase = await createClient();

        // Auth Check (Optional for debugging, enabled for prod use)
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const {
            startDate, // YYYY-MM-DD
            startTime, // HH:mm
            courts,
            matchDurationMinutes,
            dailyStartTime,
            dailyEndTime
        } = body;

        // 1. Fetch all matches (that are not byes ideally, but byes have status 'completed' or 'bye')
        // Actually we want to schedule ALL matches that are NOT 'bye' status.
        // And we want to schedule them in order: Round 1, then Round 2...

        // Find the bracket first
        const { data: bracket } = await supabase
            .from('brackets_mccarren_tournament')
            .select('id')
            .eq('tournament_id', tournament_id)
            .single();

        if (!bracket) {
            return NextResponse.json({ error: 'No bracket found' }, { status: 404 });
        }

        const { data: matches } = await supabase
            .from('matches_mccarren_tournament')
            .select('*')
            .eq('bracket_id', bracket.id)
            .neq('score', 'BYE') // Crude check for byes if status isn't reliable. Or use status != 'completed' if byes are completed.
            // Better: Order by round_number ASC, match_number_in_round ASC
            .order('round_number', { ascending: true })
            .order('match_number_in_round', { ascending: true });

        if (!matches || matches.length === 0) {
            return NextResponse.json({ message: 'No matches to schedule' });
        }

        // Filter out actual Byes if they are marked as completed/Bye
        const matchesToSchedule = matches.filter(m => m.status !== 'bye' && m.score !== 'BYE');

        // 2. Scheduling Algorithm
        const scheduledUpdates = [];

        let currentDateStr = startDate;
        let currentTimeMinutes = timeToMinutes(startTime); // Minutes from midnight
        let dayStartMinutes = timeToMinutes(dailyStartTime);
        let dayEndMinutes = timeToMinutes(dailyEndTime);
        const duration = matchDurationMinutes;

        // Helper: Format Date+Minutes to Timestamp
        const formatDateTime = (dateStr: string, minutes: number) => {
            const date = new Date(dateStr);
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            date.setHours(hours, mins, 0, 0);
            return date.toISOString();
        }

        // Helper: Add days
        const addDays = (dateStr: string, days: number) => {
            const date = new Date(dateStr);
            date.setDate(date.getDate() + days); // Local time might be tricky, usually use UTC safe strings
            // Simple string manipulation for safety if inputs are YYYY-MM-DD
            return date.toISOString().split('T')[0];
        }

        // State trackers
        let currentCourt = 1;
        // Check if initial time is valid
        if (currentTimeMinutes < dayStartMinutes) currentTimeMinutes = dayStartMinutes;

        // Iteration
        for (const match of matchesToSchedule) {
            // Check if current slot fits in the day
            if (currentTimeMinutes + duration > dayEndMinutes) {
                // Move to next day
                currentDateStr = addDays(currentDateStr, 1);
                currentTimeMinutes = dayStartMinutes;
                currentCourt = 1; // Reset to first court
            }

            // Assign
            const isoString = formatDateTime(currentDateStr, currentTimeMinutes);

            scheduledUpdates.push({
                id: match.id,
                scheduled_time: isoString,
                court: String(currentCourt), // Ensure it's string if DB is TEXT
                status: 'scheduled'
            });

            // Advance
            currentCourt++;
            if (currentCourt > courts) {
                currentCourt = 1;
                currentTimeMinutes += duration;
            }
        }

        // 3. Batch Update (simulated with parallel promises or loop, supabase Upsert works best)
        const { error: updateError } = await supabase
            .from('matches_mccarren_tournament')
            .upsert(scheduledUpdates.map(u => ({
                id: u.id,
                scheduled_time: u.scheduled_time,
                court: u.court,
                status: 'scheduled'
            })));

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, count: scheduledUpdates.length });

    } catch (error: any) {
        console.error('Auto Schedule Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}
