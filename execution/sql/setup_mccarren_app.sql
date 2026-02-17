-- =====================================================
-- MCCARREN APP - SETUP TABLES
-- Suffix: _mccarren_app
-- =====================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clubs
CREATE TABLE IF NOT EXISTS clubs_mccarren_app (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tournaments
CREATE TABLE IF NOT EXISTS tournaments_mccarren_app (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs_mccarren_app(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_players INT,
    seeding_mode TEXT DEFAULT 'random',
    status TEXT DEFAULT 'registration_open', -- registration_open, in_progress, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tournament Players (Registration)
CREATE TABLE IF NOT EXISTS tournament_players_mccarren_app (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments_mccarren_app(id) ON DELETE CASCADE,
    player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seed_number INT,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, player_id)
);

-- 5. Brackets
CREATE TABLE IF NOT EXISTS brackets_mccarren_app (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments_mccarren_app(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Main Draw',
    format TEXT DEFAULT 'single_elimination',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Matches
CREATE TABLE IF NOT EXISTS matches_mccarren_app (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bracket_id UUID REFERENCES brackets_mccarren_app(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    match_number INT NOT NULL, -- Logical number in round
    player1_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    player2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    score_text TEXT,
    status TEXT DEFAULT 'scheduled', -- scheduled, completed, bye
    next_match_id UUID REFERENCES matches_mccarren_app(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RLS Poilicies (Basic Open Access for Dev, restrict write ideally)
-- Enabling RLS
ALTER TABLE clubs_mccarren_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments_mccarren_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players_mccarren_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets_mccarren_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches_mccarren_app ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Allow ALL for now to unblock dev, verify with user for prod)
CREATE POLICY "Public Read Clubs" ON clubs_mccarren_app FOR SELECT USING (true);
CREATE POLICY "Public Read Tournaments" ON tournaments_mccarren_app FOR SELECT USING (true);
CREATE POLICY "Public Read Players" ON tournament_players_mccarren_app FOR SELECT USING (true);
CREATE POLICY "Public Read Brackets" ON brackets_mccarren_app FOR SELECT USING (true);
CREATE POLICY "Public Read Matches" ON matches_mccarren_app FOR SELECT USING (true);

-- Allow Authenticated Users to Insert/Update (Simulation of Admin/Organizer for now)
--Ideally we check for metadata role, but keeping it simple for "creating app".
CREATE POLICY "Auth Write Clubs" ON clubs_mccarren_app FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Tournaments" ON tournaments_mccarren_app FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Players" ON tournament_players_mccarren_app FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Brackets" ON brackets_mccarren_app FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Matches" ON matches_mccarren_app FOR ALL USING (auth.role() = 'authenticated');
