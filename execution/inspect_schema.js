const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../frontend', '.env.local');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

async function inspect() {
    console.log('🔍 Inspecting Tournaments Schema...');

    // Check specific columns on tournaments table
    // We want to know if 'competition_type' or 'format' or 'type' stores "singles/doubles"
    const { data: tourney, error: tError } = await supabase
        .from('tournaments_mccarren_tournament')
        .insert({
            name: 'Probe Type Tournament',
            // competition_type: 'singles' // UNCOMMENT TO PROBE
        })
        .select()
        .single();

    if (tError) {
        console.error('Tournament Insert Error:', tError);
        // If error is "column competition_type does not exist", we know.
    } else {
        console.log('Tournament Created. Keys:', Object.keys(tourney));

        // Probe update
        const { error: uError } = await supabase
            .from('tournaments_mccarren_tournament')
            .update({ competition_type: 'doubles' })
            .eq('id', tourney.id);

        if (uError) console.log('❌ competition_type mismatch/missing:', uError.message);
        else console.log('✅ competition_type exists');
    }
}

inspect();
