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
        // Fetch most recent 6 tournaments
        const { data: tournaments, error } = await supabaseAdmin
            .from('tournaments_mccarren_tournament')
            .select('id, name, start_date, end_date, status')
            .order('created_at', { ascending: false })
            .limit(6);

        if (error) throw error;

        return NextResponse.json({ tournaments });
    } catch (error: any) {
        console.error('Error fetching recent tournaments:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
