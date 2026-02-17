
-- 1. Create a dummy Club
INSERT INTO clubs_mccarren_tournament (name, address, created_at)
VALUES ('McCarren Tennis Center', '123 Bedford Ave, Brooklyn, NY', NOW())
ON CONFLICT DO NOTHING;

-- 2. Create a dummy Tournament
-- We need the Club ID for this.
WITH club AS (
  SELECT id FROM clubs_mccarren_tournament LIMIT 1
)
INSERT INTO tournaments_mccarren_tournament (name, club_id, start_date, end_date, registration_deadline, max_players, status, seeding_mode)
SELECT 'Test Open 2024', id, CURRENT_DATE, CURRENT_DATE + 7, CURRENT_DATE + 1, 32, 'registration_open', 'random'
FROM club
ON CONFLICT DO NOTHING;

-- 3. Create Dummy Users (Players) if not exist
-- NOTE: In Supabase, users are in auth.users. This is hard to seed via SQL if we don't have access to auth schema.
-- HOWEVER, we can query users_mccarren_tournament which is the public profile table.
-- Assuming we have some users or can register them. 
-- Wait, the `auth/signup` works but fails on email. 
-- Let's try to insert into users_mccarren_tournament directly if there is no FK constraint to auth.users (usually there is).

-- ALTERNATIVE: Use the existing user 'dev@local.test' (if he ends up in the table) as a player.
-- But we need multiple players.
