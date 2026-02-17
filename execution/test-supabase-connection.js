// Script simple para probar conexión con Supabase
// Ejecutar con: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Probando conexión con Supabase...');
console.log('URL:', supabaseUrl);
console.log('Anon Key presente:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('📡 Consultando tabla tournaments_mccarren_tournament...');

    const { data, error } = await supabase
      .from('tournaments_mccarren_tournament')
      .select('id, name')
      .limit(1);

    if (error) {
      console.error('❌ Error de Supabase:', error.message);
      console.error('Código de error:', error.code);
    } else {
      console.log('✅ Conexión exitosa!');
      console.log('Datos encontrados:', data?.length || 0, 'torneos');
    }
  } catch (err) {
    console.error('💥 Error inesperado:', err.message);
  }
}

testConnection();