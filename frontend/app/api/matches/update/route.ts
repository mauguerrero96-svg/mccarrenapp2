import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Auth Check
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const { match_id, winner_id, score_text } = await request.json();

        if (!match_id || !winner_id) {
            return NextResponse.json({ error: 'Missing match_id or winner_id' }, { status: 400 });
        }

        // 1. Fetch current match to get next_match_id and match_number
        // We use match_number_in_round from original schema for calculation.
        const { data: currentMatch, error: fetchError } = await supabase
            .from('matches_mccarren_tournament')
            .select('id, next_match_id, match_number_in_round, player1_id, player2_id')
            .eq('id', match_id)
            .single();

        if (fetchError || !currentMatch) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // Verify winner is actually in the match
        if (currentMatch.player1_id !== winner_id && currentMatch.player2_id !== winner_id) {
            return NextResponse.json({ error: 'Winner ID does not match any player in this match' }, { status: 400 });
        }

        // 2. Update Current Match
        // Update both score columns for compatibility
        const { error: updateError } = await supabase
            .from('matches_mccarren_tournament')
            .update({
                winner_id: winner_id,
                score: score_text,
                score_text: score_text,
                status: 'completed'
            })
            .eq('id', match_id);

        if (updateError) {
            throw new Error(`Failed to update match: ${updateError.message}`);
        }

        // 3. Advance Winner to Next Match
        if (currentMatch.next_match_id) {
            // Determine slot (Odd -> 1, Even -> 2)
            const isOdd = (currentMatch.match_number_in_round % 2 !== 0);
            const updateField = isOdd ? 'player1_id' : 'player2_id';

            const { error: advanceError } = await supabase
                .from('matches_mccarren_tournament')
                .update({
                    [updateField]: winner_id
                })
                .eq('id', currentMatch.next_match_id);

            if (advanceError) {
                console.error('Failed to advance winner:', advanceError);
                // We don't rollback the match result, but we warn.
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Update Match Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
