const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../frontend/.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing via .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminUser() {
    const email = 'bartjavier@mccarren.com';
    const password = 'tennis123';

    console.log(`Attempting to create admin user: ${email}`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            user_role: 'admin',
            full_name: 'Bart Javier'
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        return;
    }

    console.log('User created successfully:', data.user);
    console.log('User Role:', data.user.user_metadata.user_role);
}

createAdminUser();
