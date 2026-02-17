// Script para crear usuario administrador
// Ejecutar con: node create-admin-user.js

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variables de entorno faltantes');
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

// Usar service role key para crear usuario directamente
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🔧 Creando usuario administrador...');

  try {
    // Crear usuario con email y contraseña (SIN confirmar automáticamente)
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin_v2@test.com',
      password: 'Cerati96!',
      email_confirm: true, // Auto-confirm for testing purposes
      user_metadata: {
        user_role: 'admin'
      }
    });

    if (error) {
      console.error('❌ Error creando usuario:', error.message);
    } else {
      console.log('✅ Usuario administrador creado exitosamente!');
      console.log('Email:', data.user.email);
      console.log('ID:', data.user.id);
      console.log('Rol:', data.user.user_metadata?.user_role);
      console.log('Estado: Pendiente de confirmación por email');
      console.log('');
      console.log('📧 PASOS PARA CONFIRMAR:');
      console.log('1. Revisa tu email: mauguerrero96@gmail.com');
      console.log('2. Busca el email de Supabase con asunto: "Confirm your email"');
      console.log('3. Haz clic en el link de confirmación');
      console.log('4. Luego podrás iniciar sesión con:');
      console.log('   Email: mauguerrero96@gmail.com');
      console.log('   Contraseña: Cerati96!');
      console.log('');
      console.log('🔗 Si no encuentras el email, revisa tu carpeta de spam/junk');
    }
  } catch (err) {
    console.error('💥 Error inesperado:', err.message);
  }
}

createAdminUser();