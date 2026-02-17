-- =====================================================
-- UPDATE SCHEMA V2
-- =====================================================

-- Add competition_type to tournaments (Singles / Doubles)
ALTER TABLE tournaments_mccarren_tournament
ADD COLUMN IF NOT EXISTS competition_type TEXT DEFAULT 'singles';

-- Add seed_number to tournament_players (for Manual Seeding)
ALTER TABLE tournament_players_mccarren_tournament
ADD COLUMN IF NOT EXISTS seed_number INT;
