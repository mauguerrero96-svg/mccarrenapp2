import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import { generateSingleEliminationMatches, Player } from '../../../utils/tournament/drawGenerator';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Auth check (basic) - in real app check for role
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { tournament_id, seeding_mode } = await request.json();

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

    // 1. Fetch Players registered for this tournament
    const { data: registrations, error: regError } = await supabase
      .from('tournament_players_mccarren_tournament')
      .select('player_id, seed_number')
      .eq('tournament_id', tournament_id)
      .order('seed_number', { ascending: true, nullsFirst: false });

    if (regError || !registrations || registrations.length < 2) {
      console.error('Error fetching players or not enough players:', regError);
      return NextResponse.json({ error: 'Not enough players registered to generate a draw (min 2).' }, { status: 400 });
    }

    // Map to Player interface
    const players: Player[] = registrations.map((reg, idx) => ({
      id: reg.player_id,
      email: `player${idx}@example.com`
    }));

    // 2. Generate Abstract Matches
    const generatedMatches = generateSingleEliminationMatches(players, seeding_mode || 'random');

    // 3. Database Transaction (Sequential operations)

    // A. Cleanup: Delete existing bracket if any (Regenerate)
    // We assume only one Main Draw per tournament for now.
    const { error: deleteError } = await supabase
      .from('brackets_mccarren_tournament')
      .delete()
      .eq('tournament_id', tournament_id);

    if (deleteError) {
      console.error('Error deleting old bracket:', deleteError);
    }

    // B. Create Bracket Record
    const { data: bracket, error: bracketError } = await supabase
      .from('brackets_mccarren_tournament')
      .insert([{
        tournament_id: tournament_id,
        name: 'Main Draw',
        format: 'single_elimination',
      }])
      .select()
      .single();

    if (bracketError) throw new Error(`Failed to create bracket: ${bracketError.message}`);

    // C. Prepare Matches for Insert
    // Sort reverse round order to satisfy FK constraints on next_match_id
    const sortedMatches = [...generatedMatches].sort((a, b) => b.round_number - a.round_number);

    const matchesToInsert = sortedMatches.map(m => {
      return {
        id: m.id,
        bracket_id: bracket.id,
        round_number: m.round_number,
        match_number_in_round: m.match_number_in_round,
        match_number: m.match_number_in_round,
        player1_id: m.player1_id,
        player2_id: m.player2_id,
        status: m.status,
        winner_id: m.winner_id,
        score: m.score,
        score_text: m.score,
        next_match_id: m.next_match_id,
        start_time: null, // Explicitly null
        court: null      // Explicitly null
      };
    });

    // D. Insert Matches
    console.log('Inserting Matches:', matchesToInsert.length);
    const { error: matchesInsertError } = await supabase
      .from('matches_mccarren_tournament')
      .insert(matchesToInsert);

    if (matchesInsertError) {
      console.error('MATCH INSERT ERROR:', matchesInsertError);
      throw new Error(`Failed to insert matches: ${matchesInsertError.message}`);
    }

    // E. Update Tournament Status
    const { error: trnUpdateError } = await supabase
      .from('tournaments_mccarren_tournament')
      .update({ status: 'in_progress' })
      .eq('id', tournament_id);

    if (trnUpdateError) console.warn('Failed to update tournament status', trnUpdateError);

    console.log('Draw Generated Successfully');
    return NextResponse.json({ success: true, bracket_id: bracket.id }, { status: 200 });

  } catch (error: any) {
    console.error('API Route error FULL:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}