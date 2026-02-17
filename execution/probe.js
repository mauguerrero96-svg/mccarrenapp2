const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../frontend', '.env.local');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function probe() {
    console.log('Probing table structure...');
    // Try to select empty to see if it errors or works? 
    // Selecting * might not show columns if 0 rows.
    // We can try to fetching the internal schema via rpc if allowed? No.

    // Let's just try to select * limit 1.
    const { data, error } = await supabase.from('tournaments_mccarren_tournament').select('*').limit(1);
    if (error) {
        console.error('Select Error:', error);
    } else {
        console.log('Select Success. Data:', data);
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        }
    }
}
probe();
