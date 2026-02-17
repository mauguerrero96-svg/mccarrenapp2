const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../frontend/.env.local') }); // Load from root .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createUser(email, password, fullName) {
    console.log(`Creating verified user: ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: { full_name: fullName, user_role: 'player' }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        return;
    }

    console.log('User created successfully!');
    console.log('ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Metadata:', data.user.user_metadata);
    console.log('\nYou can now log in with these credentials.');
}

// Get args or use defaults
const email = process.argv[2] || 'maoumx@gmail.com';
const password = process.argv[3] || 'Mccarren2024!'; // Default password
const fullName = process.argv[4] || 'Daniel Guerrero';

createUser(email, password, fullName);
