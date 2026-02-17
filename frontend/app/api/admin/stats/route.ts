import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET() {
  try {
    const [usersResult, tournamentsResult, clubsResult] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from('tournaments_mccarren_tournament').select('id, status'),
      supabaseAdmin.from('clubs_mccarren_tournament').select('id', { count: 'exact', head: true }),
    ]);

    const totalUsers = usersResult.data?.users.length || 0;
    const totalTournaments = tournamentsResult.data?.length || 0;
    const activeTournaments =
      tournamentsResult.data?.filter(
        (t: any) => t.status === 'in_progress' || t.status === 'registration_open'
      ).length || 0;
    const totalClubs = clubsResult.count || 0;

    return NextResponse.json({
      totalUsers,
      totalTournaments,
      activeTournaments,
      totalClubs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
