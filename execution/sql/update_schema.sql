-- =====================================================
-- FIX/UPDATE SCHEMA
-- =====================================================

-- 1. Fix Matches Table (matches_mccarren_tournament)
-- Adding missing columns required for Draw generation and Scheduler.

ALTER TABLE matches_mccarren_tournament 
ADD COLUMN IF NOT EXISTS match_number INT,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS court TEXT,
ADD COLUMN IF NOT EXISTS score_text TEXT,
ADD COLUMN IF NOT EXISTS next_match_id UUID REFERENCES matches_mccarren_tournament(id);

-- Optional: Add missing Tournaments columns
ALTER TABLE tournaments_mccarren_tournament
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS max_players INT,
ADD COLUMN IF NOT EXISTS seeding_mode TEXT;

-- Verify/Add Players columns if needed
-- ALTER TABLE tournament_players_mccarren_tournament ADD COLUMN ...

-- 2. Clean up bad data (optional, but recommended if 'match_number' is now required)
-- UPDATE matches_mccarren_tournament SET match_number = 0 WHERE match_number IS NULL;
-- ALTER TABLE matches_mccarren_tournament ALTER COLUMN match_number SET NOT NULL; -- Only if you want strictness
