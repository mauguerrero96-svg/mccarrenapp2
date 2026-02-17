-- =====================================================
-- RESTORE SECURITY (RE-ENABLE RLS)
-- This script reverses 'open_access_rls.sql' and applies strict RBAC.
-- =====================================================

-- 1. Restore Helper Functions (Check Metadata)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN (SELECT auth.uid() = ANY (SELECT id FROM auth.users WHERE raw_user_meta_data->>'user_role' = 'admin'));
END;
$$;

CREATE OR REPLACE FUNCTION is_organizer()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN (SELECT auth.uid() = ANY (SELECT id FROM auth.users WHERE raw_user_meta_data->>'user_role' = 'organizer'));
END;
$$;

CREATE OR REPLACE FUNCTION is_developer()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN (SELECT auth.uid() = ANY (SELECT id FROM auth.users WHERE raw_user_meta_data->>'user_role' = 'developer'));
END;
$$;

CREATE OR REPLACE FUNCTION is_organizer_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN is_admin() OR is_developer() OR is_organizer();
END;
$$;

-- 2. Drop "Public Access" Policies
DROP POLICY IF EXISTS "Public Access" ON clubs_mccarren_tournament;
DROP POLICY IF EXISTS "Public Access" ON tournaments_mccarren_tournament;
DROP POLICY IF EXISTS "Public Access" ON tournament_players_mccarren_tournament;
DROP POLICY IF EXISTS "Public Access" ON brackets_mccarren_tournament;
DROP POLICY IF EXISTS "Public Access" ON matches_mccarren_tournament;
DROP POLICY IF EXISTS "Public Access" ON announcements_mccarren_tournament;
DROP POLICY IF EXISTS "Public Access" ON support_tickets_mccarren_tournament;

-- 3. Re-Apply Strict Policies

-- Clubs
CREATE POLICY "Clubs are viewable by all users" ON clubs_mccarren_tournament FOR SELECT USING (TRUE);

-- Tournaments
CREATE POLICY "Organizers and Admins can manage tournaments" ON tournaments_mccarren_tournament FOR ALL USING (is_organizer_or_admin()) WITH CHECK (is_organizer_or_admin());
CREATE POLICY "Players can read tournaments they are registered in" ON tournaments_mccarren_tournament FOR SELECT USING (EXISTS (SELECT 1 FROM tournament_players_mccarren_tournament WHERE tournament_id = tournaments_mccarren_tournament.id AND player_id = auth.uid()));

-- Tournament Players
CREATE POLICY "Organizers and Admins can manage tournament players" ON tournament_players_mccarren_tournament FOR ALL USING (is_organizer_or_admin()) WITH CHECK (is_organizer_or_admin());
CREATE POLICY "Players can read their own tournament registrations" ON tournament_players_mccarren_tournament FOR SELECT USING (player_id = auth.uid());

-- Brackets
CREATE POLICY "Organizers and Admins can manage brackets" ON brackets_mccarren_tournament FOR ALL USING (is_organizer_or_admin()) WITH CHECK (is_organizer_or_admin());
CREATE POLICY "All authenticated users can view brackets for accessible tournaments" ON brackets_mccarren_tournament FOR SELECT USING (EXISTS (SELECT 1 FROM tournaments_mccarren_tournament WHERE tournaments_mccarren_tournament.id = brackets_mccarren_tournament.tournament_id AND (is_organizer_or_admin() OR EXISTS (SELECT 1 FROM tournament_players_mccarren_tournament WHERE tournament_id = tournaments_mccarren_tournament.id AND player_id = auth.uid()))));

-- Matches
CREATE POLICY "Organizers and Admins can manage matches" ON matches_mccarren_tournament FOR ALL USING (is_organizer_or_admin()) WITH CHECK (is_organizer_or_admin());
CREATE POLICY "Players can read their own matches" ON matches_mccarren_tournament FOR SELECT USING (player1_id = auth.uid() OR player2_id = auth.uid());
CREATE POLICY "All authenticated users can view matches for accessible tournaments" ON matches_mccarren_tournament FOR SELECT USING (EXISTS (SELECT 1 FROM brackets_mccarren_tournament WHERE brackets_mccarren_tournament.id = matches_mccarren_tournament.bracket_id AND EXISTS (SELECT 1 FROM tournaments_mccarren_tournament WHERE tournaments_mccarren_tournament.id = brackets_mccarren_tournament.tournament_id AND (is_organizer_or_admin() OR EXISTS (SELECT 1 FROM tournament_players_mccarren_tournament WHERE tournament_id = tournaments_mccarren_tournament.id AND player_id = auth.uid())))));

-- Announcements
CREATE POLICY "Organizers and Admins can manage announcements" ON announcements_mccarren_tournament FOR ALL USING (is_organizer_or_admin()) WITH CHECK (is_organizer_or_admin());
CREATE POLICY "All authenticated users can view announcements for accessible tournaments" ON announcements_mccarren_tournament FOR SELECT USING (EXISTS (SELECT 1 FROM tournaments_mccarren_tournament WHERE tournaments_mccarren_tournament.id = announcements_mccarren_tournament.tournament_id AND (is_organizer_or_admin() OR EXISTS (SELECT 1 FROM tournament_players_mccarren_tournament WHERE tournament_id = tournaments_mccarren_tournament.id AND player_id = auth.uid()))));

-- Support Tickets
CREATE POLICY "Players can create support tickets for themselves" ON support_tickets_mccarren_tournament FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Players can read their own support tickets" ON support_tickets_mccarren_tournament FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Organizers and Admins can manage all support tickets" ON support_tickets_mccarren_tournament FOR ALL USING (is_organizer_or_admin()) WITH CHECK (is_organizer_or_admin());
