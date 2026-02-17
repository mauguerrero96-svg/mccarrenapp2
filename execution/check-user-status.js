// Script para verificar el estado del usuario administrador
// Ejecutar con: node check-user-status.js

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

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUserStatus() {
  console.log('🔍 Verificando estado del usuario administrador...');

  try {
    // Buscar usuario por email
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Error obteniendo usuarios:', error.message);
      return;
    }

    const adminUser = data.users.find(user => user.email === 'mauguerrero96@gmail.com');

    if (!adminUser) {
      console.log('❌ Usuario NO encontrado');
      console.log('Posibles causas:');
      console.log('- El usuario no fue creado');
      console.log('- Error en el proceso de creación');
      console.log('');
      console.log('Solución: Ejecuta uno de estos scripts:');
      console.log('- node execution/create-admin-user.js (confirmación automática)');
      console.log('- node execution/create-admin-user-email-confirm.js (requiere email)');
      console.log('- O usa http://localhost:3000/setup-admin');
    } else {
      console.log('✅ Usuario encontrado!');
      console.log('Email:', adminUser.email);
      console.log('ID:', adminUser.id);
      console.log('Rol:', adminUser.user_metadata?.user_role);
      console.log('Confirmado:', adminUser.email_confirmed_at ? '✅ Sí' : '❌ NO');
      console.log('Creado:', adminUser.created_at);
      console.log('Último login:', adminUser.last_sign_in_at || 'Nunca');

      if (!adminUser.email_confirmed_at) {
        console.log('');
        console.log('⚠️  PROBLEMA: El usuario NO está confirmado por email');
        console.log('Soluciones:');
        console.log('1. Confirma el email haciendo clic en el link enviado');
        console.log('2. O ejecuta: node execution/create-admin-user.js (confirmación automática)');
      } else {
        console.log('');
        console.log('✅ El usuario está confirmado y debería poder hacer login');
        console.log('Si no puedes hacer login, revisa:');
        console.log('- Credenciales correctas: mauguerrero96@gmail.com / Cerati96!');
        console.log('- Conexión a internet');
        console.log('- Variables de entorno en .env.local');
      }
    }

  } catch (err) {
    console.error('💥 Error inesperado:', err.message);
  }
}

checkUserStatus();