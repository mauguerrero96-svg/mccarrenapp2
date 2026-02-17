// Script para crear 32 jugadores de prueba y registrarlos en un nuevo torneo
// Ejecutar con: node execution/create-test-players.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar .env.local manualmente
const envPath = path.resolve(__dirname, '../frontend', '.env.local');
console.log('Loading env from:', envPath);
try {
  const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
  console.log('Keys found in .env.local:', Object.keys(envConfig));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (e) {
  console.error('Error loading env:', e.message);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Variables de entorno faltantes');
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestTournament() {
  console.log('🎾 Iniciando configuración de torneo de 32 jugadores...');

  // 1. Crear Torneo
  console.log('\n🏆 Creando "Torneo Master 32"...');

  // Buscar o crear club
  // Use CORRECT suffix based on user feedback and validation
  let { data: clubs } = await supabase.from('clubs_mccarren_tournament').select('id').limit(1);
  let clubId;

  if (!clubs || clubs.length === 0) {
    console.log('  Creando Club de prueba...');
    const { data: newClub, error: clubError } = await supabase.from('clubs_mccarren_tournament').insert({ name: 'Mccarren Park' }).select().single();
    if (clubError) {
      console.error('Error creating club:', clubError);
      return;
    }
    clubId = newClub.id;
  } else {
    clubId = clubs[0].id;
  }

  // Create Tournament using ONLY fields we are confident about or minimal set
  // The user said "end_date column does not exist".
  // We will assume 'name', 'club_id', 'max_players' are safe.
  const { data: tournament, error: tError } = await supabase
    .from('tournaments_mccarren_tournament')
    .insert({
      name: 'Torneo Master 32',
      club_id: clubId
      // Removed all optional fields to pass schema validation
    })
    .select()
    .single();

  if (tError) {
    console.error('❌ Error creando torneo:', tError);
    // If this fails, it might be due to MISSING required columns like start_date (if it exists).
    // The error message will guide us.
    return;
  }
  console.log(`✅ Torneo creado: ${tournament.name} (${tournament.id})`);

  // 2. Crear y Registrar 32 Jugadores
  console.log('\n👥 Generando 32 jugadores...');

  const createdUsers = [];

  for (let i = 1; i <= 32; i++) {
    const email = `player${i}_32_v2@test.com`; // Changed email to avoid earlier duplicates
    const name = `Jugador ${i}`;
    const password = 'Password123!';

    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: name, user_role: 'player' }
    });

    if (error) {
      console.warn(`  ⚠️ Error/Info usuario ${i}: ${error.message}`);
    }

    if (data && data.user) {
      createdUsers.push(data.user);
      process.stdout.write('.');
    }
  }
  console.log(`\n✅ ${createdUsers.length} usuarios nuevos creados.`);

  // 3. Registrar en el torneo
  console.log('\n📋 Registrando jugadores en el torneo...');

  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const { error: regError } = await supabase
      .from('tournament_players_mccarren_tournament')
      .insert({
        tournament_id: tournament.id,
        player_id: user.id,
        seed_number: i + 1
      });

    if (regError) console.error(`  ❌ Error registrando ${user.email}:`, regError.message);
  }

  console.log(`\n🎉 ¡Proceso completo!`);
  console.log(`🆔 ID del Torneo: ${tournament.id}`);
  console.log(`👉 Ve a: http://localhost:3000/admin/tournaments/${tournament.id}/draw`);
}

createTestTournament();