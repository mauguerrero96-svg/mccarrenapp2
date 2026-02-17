import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Active Tournaments
        // Join tournaments through tournament_players
        const { data: registrations, error: regError } = await supabase
            .from('tournament_players_mccarren_tournament')
            .select(`
        tournament_id,
        tournaments_mccarren_tournament (
          id,
          name,
          start_date,
          status,
          club_id
        )
      `)
            .eq('player_id', user.id);

        if (regError) {
            console.error('Error fetching registrations:', regError);
            throw regError;
        }

        const activeTournaments = registrations?.map((reg: any) => ({
            id: reg.tournaments_mccarren_tournament.id,
            name: reg.tournaments_mccarren_tournament.name,
            status: reg.tournaments_mccarren_tournament.status,
            startDate: reg.tournaments_mccarren_tournament.start_date,
            userStatus: 'registered'
        })) || [];

        // 2. Fetch Next Match
        // Search matches in all active tournaments for this player
        // Note: We need to search across tournaments. If matches are in a single table 'matches_mccarren_tournament', easy.
        // If they are per tournament, difficult. 
        // Based on previous files, likely 'matches_mccarren_tournament' with 'tournament_id'.

        const { data: matches, error: matchError } = await supabase
            .from('matches_mccarren_tournament')
            .select(`
        id,
        tournament_id,
        round_name,
        start_time,
        court_id,
        player1_id,
        player2_id,
        winner_id,
        tournaments_mccarren_tournament (name)
      `)
            .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
            .is('winner_id', null) // Only unplayed matches
            .gte('start_time', new Date().toISOString()) // Future matches ideally, or just unplayed
            .order('start_time', { ascending: true })
            .limit(1);

        let nextMatch = null;
        if (matches && matches.length > 0) {
            const match = matches[0];
            const opponentId = match.player1_id === user.id ? match.player2_id : match.player1_id;

            // Try to get opponent name if possible (mock if necessary for now as we don't have easy user table access)
            // In a real app we'd join user table or fetch profile. 
            // For now we'll format it as "Player <ID>" or just "Opponent"

            nextMatch = {
                id: match.id,
                tournamentName: Array.isArray(match.tournaments_mccarren_tournament)
                    ? match.tournaments_mccarren_tournament[0]?.name
                    : (match.tournaments_mccarren_tournament as any)?.name,
                round: match.round_name,
                startTime: match.start_time,
                court: match.court_id ? `Court ${match.court_id}` : 'TBD',
                opponentId: opponentId,
                // Since we can't join users easily yet, we'll send ID and handle display on client or generic
                opponentName: opponentId ? 'Opponent' : 'Bye'
            };
        }

        // 3. Calculate Stats
        const { count: totalMatches, error: matchesError } = await supabase
            .from('matches_mccarren_tournament')
            .select('*', { count: 'exact', head: true })
            .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
            .not('winner_id', 'is', null);

        const { count: matchesWon, error: wonError } = await supabase
            .from('matches_mccarren_tournament')
            .select('*', { count: 'exact', head: true })
            .eq('winner_id', user.id);

        const stats = {
            totalMatches: totalMatches || 0,
            matchesWon: matchesWon || 0,
            winRate: totalMatches ? Math.round(((matchesWon || 0) / totalMatches) * 100) : 0,
            tournamentsPlayed: activeTournaments.length // Simple approximation for now
        };

        return NextResponse.json({
            activeTournaments,
            nextMatch,
            stats,
            userRole: user.user_metadata?.user_role || 'player'
        });

    } catch (error: any) {
        console.error('Error in player dashboard API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
