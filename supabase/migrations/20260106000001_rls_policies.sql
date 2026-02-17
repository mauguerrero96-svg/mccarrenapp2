-- Enable RLS for all tables
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN (SELECT auth.uid() = ANY (SELECT id FROM auth.users WHERE raw_user_meta_data->>'user_role' = 'admin'));
END;
$$
;

CREATE OR REPLACE FUNCTION is_organizer()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN (SELECT auth.uid() = ANY (SELECT id FROM auth.users WHERE raw_user_meta_data->>'user_role' = 'organizer'));
END;
$$
;

CREATE OR REPLACE FUNCTION is_organizer_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN is_admin() OR is_organizer();
END;
$$
;

-- CLUBS TABLE RLS
CREATE POLICY "Clubs are viewable by all users" ON clubs FOR SELECT USING (TRUE);

-- TOURNAMENTS TABLE RLS
CREATE POLICY "Organizers and Admins can manage tournaments" ON tournaments
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

CREATE POLICY "Players can read tournaments they are registered in" ON tournaments
FOR SELECT
USING (EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = tournaments.id AND player_id = auth.uid()));

-- TOURNAMENT_PLAYERS TABLE RLS
CREATE POLICY "Organizers and Admins can manage tournament players" ON tournament_players
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

CREATE POLICY "Players can read their own tournament registrations" ON tournament_players
FOR SELECT
USING (player_id = auth.uid());

-- BRACKETS TABLE RLS
CREATE POLICY "Organizers and Admins can manage brackets" ON brackets
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

CREATE POLICY "All authenticated users can view brackets for accessible tournaments" ON brackets
FOR SELECT
USING (EXISTS (SELECT 1 FROM tournaments WHERE tournaments.id = brackets.tournament_id AND (is_organizer_or_admin() OR EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = tournaments.id AND player_id = auth.uid()))));

-- MATCHES TABLE RLS
CREATE POLICY "Organizers and Admins can manage matches" ON matches
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

CREATE POLICY "Players can read their own matches" ON matches
FOR SELECT
USING (player1_id = auth.uid() OR player2_id = auth.uid());

CREATE POLICY "All authenticated users can view matches for accessible tournaments" ON matches
FOR SELECT
USING (EXISTS (SELECT 1 FROM brackets WHERE brackets.id = matches.bracket_id AND EXISTS (SELECT 1 FROM tournaments WHERE tournaments.id = brackets.tournament_id AND (is_organizer_or_admin() OR EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = tournaments.id AND player_id = auth.uid())))));

-- ANNOUNCEMENTS TABLE RLS
CREATE POLICY "Organizers and Admins can manage announcements" ON announcements
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

CREATE POLICY "All authenticated users can view announcements for accessible tournaments" ON announcements
FOR SELECT
USING (EXISTS (SELECT 1 FROM tournaments WHERE tournaments.id = announcements.tournament_id AND (is_organizer_or_admin() OR EXISTS (SELECT 1 FROM tournament_players WHERE tournament_id = tournaments.id AND player_id = auth.uid()))));

-- SUPPORT_TICKETS TABLE RLS
CREATE POLICY "Players can create support tickets for themselves" ON support_tickets
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Players can read their own support tickets" ON support_tickets
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Organizers and Admins can manage all support tickets" ON support_tickets
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

