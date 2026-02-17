// Script para crear usuario administrador CON confirmación por email
// Ejecutar con: node create-admin-user-email-confirm.js

const { createClient } = require('@supabase/supabase-js');

// Hardcoded for now - replace with your actual values
const supabaseUrl = 'http://86.48.22.47:9000';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔧 Using Supabase URL:', supabaseUrl);

// Usar service role key para crear usuario
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🔧 Creando usuario administrador...');

  try {
    // Crear usuario con email y contraseña (CONFIRMADO AUTOMÁTICAMENTE)
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'mauguerrero96@gmail.com',
      password: 'Cerati96!',
      email_confirm: true, // CONFIRMADO AUTOMÁTICAMENTE - puede iniciar sesión inmediatamente
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
      console.log('Estado: CONFIRMADO AUTOMÁTICAMENTE');
      console.log('');
      console.log('🚀 PUEDES INICIAR SESIÓN INMEDIATAMENTE:');
      console.log('   Email: mauguerrero96@gmail.com');
      console.log('   Contraseña: Cerati96!');
      console.log('');
      console.log('📍 Ve a: http://localhost:3000/auth/login');
      console.log('');
      console.log('⚠️  IMPORTANTE: Este usuario tiene rol de administrador');
    }
  } catch (err) {
    console.error('💥 Error inesperado:', err.message);
  }
}

createAdminUser();