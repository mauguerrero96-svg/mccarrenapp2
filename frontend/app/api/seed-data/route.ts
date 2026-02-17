import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({
            error: 'Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
        }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // 1. Create or Find 32 Users
        const playerIds: string[] = [];

        // We will try to create them, if they exist we'll just log it.
        // Then we fetch all users to get their IDs.
        for (let i = 1; i <= 32; i++) {
            const email = `player${i}@test.com`;
            const { error } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: 'password123',
                email_confirm: true,
                user_metadata: { full_name: `Player ${i}` }
            });
            if (error && !error.message.includes('already registered')) {
                console.error(`Failed to create ${email}:`, error.message);
            }
        }

        // Fetch users to get IDs (listing 100 should be enough for our 32 test users)
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
        if (listError) throw listError;

        if (users) {
            const targetEmails = new Set(Array.from({ length: 32 }, (_, i) => `player${i + 1}@test.com`));
            const validUsers = users.filter((u: any) => targetEmails.has(u.email || ''));
            validUsers.forEach((u: any) => playerIds.push(u.id));
        }

        if (playerIds.length < 2) {
            return NextResponse.json({ error: 'Need at least 2 players to create a tournament.' }, { status: 400 });
        }

        // 2. Create or Find Club
        let clubId;
        const { data: club } = await supabaseAdmin
            .from('clubs')
            .insert({ name: 'McCarren Park Tennis Center' })
            .select()
            .single();

        if (club) {
            clubId = club.id;
        } else {
            const { data: existingClub } = await supabaseAdmin.from('clubs').select('id').limit(1).single();
            clubId = existingClub?.id;
        }

        if (!clubId) throw new Error('Could not create or find a club');

        // 3. Create Tournament
        const { data: tournament, error: trnError } = await supabaseAdmin
            .from('tournaments')
            .insert({
                name: '32-Player Test Open',
                club_id: clubId,
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'registration_open',
                max_players: 32,
                seeding_mode: 'random'
            })
            .select()
            .single();

        if (trnError) throw trnError;
        const tournamentId = tournament.id;

        // 4. Register Players
        // Only register up to 32 players
        const registrations = playerIds.slice(0, 32).map(id => ({
            tournament_id: tournamentId,
            player_id: id,
        }));

        const { error: regError } = await supabaseAdmin
            .from('tournament_players')
            .insert(registrations);

        if (regError) throw regError;

        return NextResponse.json({
            success: true,
            tournamentId,
            message: `Created tournament with ${registrations.length} players.`
        });

    } catch (e: any) {
        console.error("Seed error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
