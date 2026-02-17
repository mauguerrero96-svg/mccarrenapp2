import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for API Route');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
    try {
        const { match_id, score, winner_id } = await request.json();

        if (!match_id || !score || !winner_id) {
            return NextResponse.json({ error: 'Missing match_id, score, or winner_id' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin.rpc('report_score_mccarren_tournament', {
            p_match_id: match_id,
            p_score_text: score,
            p_winner_id: winner_id,
        });

        if (error) {
            console.error('Error calling report_score_mccarren_tournament:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });

    } catch (error) {
        console.error('API Route error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
