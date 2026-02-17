const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testVal() {
    // 1. Get a tournament
    const { data: tournaments, error } = await supabase
        .from('tournaments_mccarren_tournament')
        .select('*')
        .limit(1);

    if (error || !tournaments.length) {
        console.error('No tournaments found', error);
        return;
    }

    const tId = tournaments[0].id;
    console.log('Testing with Tournament:', tId, tournaments[0].name);

    // 2. Call API (mocking fetch since we are in node)
    // Actually, we can just invoke the logic or curl if the server is running.
    // Let's use fetch against localhost.

    try {
        const res = await fetch('http://localhost:3000/api/generate-draw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tournament_id: tId,
                seeding_mode: 'standard'
            })
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testVal();
