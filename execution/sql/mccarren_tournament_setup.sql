-- =====================================================
-- MCCARREN TOURNAMENT - CREACIÓN DE TABLAS
-- Ejecutar en orden: 1.Esquema → 2.Politicas → 3.Funciones
-- =====================================================

-- ============ 1. ESQUEMA DE TABLAS ============

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: clubs_mccarren_tournament
CREATE TABLE clubs_mccarren_tournament (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: tournaments_mccarren_tournament
CREATE TABLE tournaments_mccarren_tournament (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs_mccarren_tournament(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_players INT,
    seeding_mode TEXT, -- e.g., 'random', 'elo', 'manual'
    status TEXT DEFAULT 'registration_open', -- e.g., 'registration_open', 'in_progress', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: tournament_players_mccarren_tournament
CREATE TABLE tournament_players_mccarren_tournament (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments_mccarren_tournament(id) ON DELETE CASCADE,
    player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seed_number INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, player_id)
);

-- Tabla: brackets_mccarren_tournament
CREATE TABLE brackets_mccarren_tournament (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments_mccarren_tournament(id) ON DELETE CASCADE,
    name TEXT, -- e.g., "Men's Singles", "Women's Doubles"
    format TEXT, -- e.g., 'single_elimination', 'round_robin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: matches_mccarren_tournament
CREATE TABLE matches_mccarren_tournament (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bracket_id UUID REFERENCES brackets_mccarren_tournament(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    match_number_in_round INT NOT NULL,
    player1_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    player2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    score TEXT, -- e.g., '6-3, 6-4'
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed'
    scheduled_time TIMESTAMP WITH TIME ZONE,
    court_number INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_match_id UUID REFERENCES matches_mccarren_tournament(id) ON DELETE SET NULL,
    next_match_slot INT -- 1 for player1, 2 for player2 in the next match
);

-- Tabla: announcements_mccarren_tournament
CREATE TABLE announcements_mccarren_tournament (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments_mccarren_tournament(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tabla: support_tickets_mccarren_tournament
CREATE TABLE support_tickets_mccarren_tournament (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ 2. POLÍTICAS DE SEGURIDAD (RLS) ============

-- Habilitar RLS en todas las tablas
ALTER TABLE clubs_mccarren_tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments_mccarren_tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players_mccarren_tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets_mccarren_tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches_mccarren_tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements_mccarren_tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets_mccarren_tournament ENABLE ROW LEVEL SECURITY;

-- Funciones helper para RLS
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

CREATE OR REPLACE FUNCTION is_organizer_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN is_admin() OR is_organizer();
END;
$$;

-- Políticas para clubs_mccarren_tournament
CREATE POLICY "Clubs are viewable by all users" ON clubs_mccarren_tournament FOR SELECT USING (TRUE);

-- Políticas para tournaments_mccarren_tournament
CREATE POLICY "Organizers and Admins can manage tournaments" ON tournaments_mccarren_tournament
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

CREATE POLICY "Players can read tournaments they are registered in" ON tournaments_mccarren_tournament
FOR SELECT
USING (EXISTS (SELECT 1 FROM tournament_players_mccarren_tournament WHERE tournament_id = tournaments_mccarren_tournament.id AND player_id = auth.uid()));

-- Políticas para tournament_players_mccarren_tournament
CREATE POLICY "Organizers and Admins can manage tournament players" ON tournament_players_mccarren_tournament
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

CREATE POLICY "Players can read their own tournament registrations" ON tournament_players_mccarren_tournament
FOR SELECT
USING (player_id = auth.uid());

-- Políticas para brackets_mccarren_tournament
CREATE POLICY "Organizers and Admins can manage brackets" ON brackets_mccarren_tournament
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

CREATE POLICY "All authenticated users can view brackets for accessible tournaments" ON brackets_mccarren_tournament
FOR SELECT
USING (EXISTS (SELECT 1 FROM tournaments_mccarren_tournament WHERE tournaments_mccarren_tournament.id = brackets_mccarren_tournament.tournament_id AND (is_organizer_or_admin() OR EXISTS (SELECT 1 FROM tournament_players_mccarren_tournament WHERE tournament_id = tournaments_mccarren_tournament.id AND player_id = auth.uid()))));

-- Políticas para matches_mccarren_tournament
CREATE POLICY "Organizers and Admins can manage matches" ON matches_mccarren_tournament
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

CREATE POLICY "Players can read their own matches" ON matches_mccarren_tournament
FOR SELECT
USING (player1_id = auth.uid() OR player2_id = auth.uid());

CREATE POLICY "All authenticated users can view matches for accessible tournaments" ON matches_mccarren_tournament
FOR SELECT
USING (EXISTS (SELECT 1 FROM brackets_mccarren_tournament WHERE brackets_mccarren_tournament.id = matches_mccarren_tournament.bracket_id AND EXISTS (SELECT 1 FROM tournaments_mccarren_tournament WHERE tournaments_mccarren_tournament.id = brackets_mccarren_tournament.tournament_id AND (is_organizer_or_admin() OR EXISTS (SELECT 1 FROM tournament_players_mccarren_tournament WHERE tournament_id = tournaments_mccarren_tournament.id AND player_id = auth.uid())))));

-- Políticas para announcements_mccarren_tournament
CREATE POLICY "Organizers and Admins can manage announcements" ON announcements_mccarren_tournament
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

CREATE POLICY "All authenticated users can view announcements for accessible tournaments" ON announcements_mccarren_tournament
FOR SELECT
USING (EXISTS (SELECT 1 FROM tournaments_mccarren_tournament WHERE tournaments_mccarren_tournament.id = announcements_mccarren_tournament.tournament_id AND (is_organizer_or_admin() OR EXISTS (SELECT 1 FROM tournament_players_mccarren_tournament WHERE tournament_id = tournaments_mccarren_tournament.id AND player_id = auth.uid()))));

-- Políticas para support_tickets_mccarren_tournament
CREATE POLICY "Players can create support tickets for themselves" ON support_tickets_mccarren_tournament
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Players can read their own support tickets" ON support_tickets_mccarren_tournament
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Organizers and Admins can manage all support tickets" ON support_tickets_mccarren_tournament
FOR ALL
USING (is_organizer_or_admin())
WITH CHECK (is_organizer_or_admin());

-- ============ 3. FUNCIONES DEL SERVIDOR ============

-- Función generate_draw_mccarren_tournament
CREATE OR REPLACE FUNCTION generate_draw_mccarren_tournament(p_tournament_id UUID, p_seeding_mode TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_num_players INT;
    v_bracket_size INT;
    v_num_byes INT;
    v_bracket_id UUID;
    v_player_ids UUID[];
    v_current_round_matches_count INT;
    v_next_round_match_id UUID;
    v_match_idx INT := 0;
    v_player_counter INT := 0;
    v_player1_id UUID;
    v_player2_id UUID;
    v_round INT := 1;
    v_temp_match_ids UUID[];
    v_current_match_id UUID;
BEGIN
    -- Check if a bracket already exists for this tournament
    IF EXISTS (SELECT 1 FROM brackets_mccarren_tournament WHERE tournament_id = p_tournament_id) THEN
        RAISE EXCEPTION 'A bracket already exists for this tournament.';
    END IF;

    -- Fetch players for the tournament based on seeding mode
    IF p_seeding_mode = 'random' THEN
        SELECT ARRAY(SELECT player_id FROM tournament_players_mccarren_tournament WHERE tournament_id = p_tournament_id ORDER BY RANDOM()) INTO v_player_ids;
    ELSIF p_seeding_mode = 'manual' THEN
        SELECT ARRAY(SELECT player_id FROM tournament_players_mccarren_tournament WHERE tournament_id = p_tournament_id ORDER BY seed_number ASC) INTO v_player_ids;
    ELSE
        RAISE EXCEPTION 'Invalid seeding mode. Must be \'random\' or \'manual\'.';
    END IF;

    v_num_players := array_length(v_player_ids, 1);

    IF v_num_players < 2 THEN
        RAISE EXCEPTION 'Not enough players to generate a draw (minimum 2).';
    END IF;

    -- Calculate bracket size (next power of 2)
    v_bracket_size := 1;
    WHILE v_bracket_size < v_num_players LOOP
        v_bracket_size := v_bracket_size * 2;
    END LOOP;

    v_num_byes := v_bracket_size - v_num_players;

    -- Create the bracket
    INSERT INTO brackets_mccarren_tournament (tournament_id, name, format) VALUES (p_tournament_id, 'Single Elimination', 'single_elimination')
    RETURNING id INTO v_bracket_id;

    -- Initialize temporary array for current round match IDs
    v_temp_match_ids := ARRAY[]::UUID[];

    -- Create first round matches (and byes)
    v_current_round_matches_count := v_bracket_size / 2;
    FOR i IN 1..v_current_round_matches_count LOOP
        v_player1_id := NULL;
        v_player2_id := NULL;

        -- Assign players from the seeded list
        IF v_player_counter < v_num_players THEN
            v_player1_id := v_player_ids[v_player_counter + 1];
            v_player_counter := v_player_counter + 1;
        END IF;

        IF v_player_counter < v_num_players THEN
            v_player2_id := v_player_ids[v_player_counter + 1];
            v_player_counter := v_player_counter + 1;
        END IF;

        INSERT INTO matches_mccarren_tournament (bracket_id, round_number, match_number_in_round, player1_id, player2_id)
        VALUES (v_bracket_id, 1, i, v_player1_id, v_player2_id)
        RETURNING id INTO v_current_match_id;

        v_temp_match_ids := array_append(v_temp_match_ids, v_current_match_id);

        -- Handle byes in the first round - auto-advance player
        IF v_player1_id IS NOT NULL AND v_player2_id IS NULL THEN
            UPDATE matches_mccarren_tournament SET winner_id = v_player1_id, status = 'completed', score = 'BYE' WHERE id = v_current_match_id;
        ELSIF v_player1_id IS NULL AND v_player2_id IS NOT NULL THEN
            UPDATE matches_mccarren_tournament SET winner_id = v_player2_id, status = 'completed', score = 'BYE' WHERE id = v_current_match_id;
        END IF;
    END LOOP;

    -- Create subsequent rounds (placeholder matches)
    v_round := 2;
    WHILE v_current_round_matches_count > 1 LOOP
        v_current_round_matches_count := v_current_round_matches_count / 2;
        v_temp_match_ids := ARRAY[]::UUID[]; -- Reset for next round

        FOR i IN 1..v_current_round_matches_count LOOP
            INSERT INTO matches_mccarren_tournament (bracket_id, round_number, match_number_in_round)
            VALUES (v_bracket_id, v_round, i)
            RETURNING id INTO v_next_round_match_id;

            v_temp_match_ids := array_append(v_temp_match_ids, v_next_round_match_id);
        END LOOP;

        -- Link previous round matches to current round placeholder matches
        FOR i IN 1..array_length(v_temp_match_ids, 1) LOOP
            -- Link player 1 slot
            UPDATE matches_mccarren_tournament SET next_match_id = v_temp_match_ids[i], next_match_slot = 1
            WHERE id = v_temp_match_ids[2*i - 1];
            -- Link player 2 slot
            UPDATE matches_mccarren_tournament SET next_match_id = v_temp_match_ids[i], next_match_slot = 2
            WHERE id = v_temp_match_ids[2*i];
        END LOOP;

        v_round := v_round + 1;
    END LOOP;

    -- Update tournament status
    UPDATE tournaments_mccarren_tournament SET status = 'in_progress' WHERE id = p_tournament_id;

    RETURN TRUE;
END;
$$;

-- Función report_score_mccarren_tournament
CREATE OR REPLACE FUNCTION report_score_mccarren_tournament(p_match_id UUID, p_score_text TEXT, p_winner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_next_match_id UUID;
    v_next_match_slot INT;
    v_bracket_id UUID;
    v_player1_id UUID;
    v_player2_id UUID;
BEGIN
    -- Update the current match score and winner
    UPDATE matches_mccarren_tournament
    SET
        score = p_score_text,
        winner_id = p_winner_id,
        status = 'completed'
    WHERE id = p_match_id
    RETURNING next_match_id, next_match_slot, bracket_id, player1_id, player2_id
    INTO v_next_match_id, v_next_match_slot, v_bracket_id, v_player1_id, v_player2_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Match with ID % not found.', p_match_id;
    END IF;

    -- Check if the winner_id is one of the players in the match
    IF p_winner_id IS DISTINCT FROM v_player1_id AND p_winner_id IS DISTINCT FROM v_player2_id THEN
        RAISE EXCEPTION 'Winner ID % is not a player in this match.', p_winner_id;
    END IF;

    -- Advance the winner to the next match if it exists
    IF v_next_match_id IS NOT NULL THEN
        IF v_next_match_slot = 1 THEN
            UPDATE matches_mccarren_tournament
            SET player1_id = p_winner_id
            WHERE id = v_next_match_id;
        ELSIF v_next_match_slot = 2 THEN
            UPDATE matches_mccarren_tournament
            SET player2_id = p_winner_id
            WHERE id = v_next_match_id;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$;