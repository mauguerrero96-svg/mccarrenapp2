-- =====================================================
-- OPEN ACCESS (DISABLE AUTH)
-- This script updates RLS policies to allow public access.
-- =====================================================

-- 1. Helper function that always returns TRUE
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN TRUE; END; $$;

CREATE OR REPLACE FUNCTION is_organizer()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN TRUE; END; $$;

CREATE OR REPLACE FUNCTION is_organizer_or_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN TRUE; END; $$;

-- 2. Update Policies to be permissive
-- We will DROP existing specific policies and create "Allow All" policies for each table.

-- clubs_mccarren_tournament
DROP POLICY IF EXISTS "Clubs are viewable by all users" ON clubs_mccarren_tournament;
CREATE POLICY "Public Access" ON clubs_mccarren_tournament FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- tournaments_mccarren_tournament
DROP POLICY IF EXISTS "Organizers and Admins can manage tournaments" ON tournaments_mccarren_tournament;
DROP POLICY IF EXISTS "Players can read tournaments they are registered in" ON tournaments_mccarren_tournament;
CREATE POLICY "Public Access" ON tournaments_mccarren_tournament FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- tournament_players_mccarren_tournament
DROP POLICY IF EXISTS "Organizers and Admins can manage tournament players" ON tournament_players_mccarren_tournament;
DROP POLICY IF EXISTS "Players can read their own tournament registrations" ON tournament_players_mccarren_tournament;
CREATE POLICY "Public Access" ON tournament_players_mccarren_tournament FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- brackets_mccarren_tournament
DROP POLICY IF EXISTS "Organizers and Admins can manage brackets" ON brackets_mccarren_tournament;
DROP POLICY IF EXISTS "All authenticated users can view brackets for accessible tournaments" ON brackets_mccarren_tournament;
CREATE POLICY "Public Access" ON brackets_mccarren_tournament FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- matches_mccarren_tournament
DROP POLICY IF EXISTS "Organizers and Admins can manage matches" ON matches_mccarren_tournament;
DROP POLICY IF EXISTS "Players can read their own matches" ON matches_mccarren_tournament;
DROP POLICY IF EXISTS "All authenticated users can view matches for accessible tournaments" ON matches_mccarren_tournament;
CREATE POLICY "Public Access" ON matches_mccarren_tournament FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- announcements_mccarren_tournament
DROP POLICY IF EXISTS "Organizers and Admins can manage announcements" ON announcements_mccarren_tournament;
DROP POLICY IF EXISTS "All authenticated users can view announcements for accessible tournaments" ON announcements_mccarren_tournament;
CREATE POLICY "Public Access" ON announcements_mccarren_tournament FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- support_tickets_mccarren_tournament
DROP POLICY IF EXISTS "Players can create support tickets for themselves" ON support_tickets_mccarren_tournament;
DROP POLICY IF EXISTS "Players can read their own support tickets" ON support_tickets_mccarren_tournament;
DROP POLICY IF EXISTS "Organizers and Admins can manage all support tickets" ON support_tickets_mccarren_tournament;
CREATE POLICY "Public Access" ON support_tickets_mccarren_tournament FOR ALL USING (TRUE) WITH CHECK (TRUE);
