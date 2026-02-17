CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION generate_draw(p_tournament_id UUID, p_seeding_mode TEXT)
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
    IF EXISTS (SELECT 1 FROM brackets WHERE tournament_id = p_tournament_id) THEN
        RAISE EXCEPTION 'A bracket already exists for this tournament.';
    END IF;

    -- Fetch players for the tournament based on seeding mode
    IF p_seeding_mode = 'random' THEN
        SELECT ARRAY(SELECT player_id FROM tournament_players WHERE tournament_id = p_tournament_id ORDER BY RANDOM()) INTO v_player_ids;
    ELSIF p_seeding_mode = 'manual' THEN
        SELECT ARRAY(SELECT player_id FROM tournament_players WHERE tournament_id = p_tournament_id ORDER BY seed_number ASC) INTO v_player_ids;
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
    INSERT INTO brackets (tournament_id, name, format) VALUES (p_tournament_id, 'Single Elimination', 'single_elimination')
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

        INSERT INTO matches (bracket_id, round_number, match_number_in_round, player1_id, player2_id)
        VALUES (v_bracket_id, 1, i, v_player1_id, v_player2_id)
        RETURNING id INTO v_current_match_id;

        v_temp_match_ids := array_append(v_temp_match_ids, v_current_match_id);

        -- Handle byes in the first round - auto-advance player
        IF v_player1_id IS NOT NULL AND v_player2_id IS NULL THEN
            UPDATE matches SET winner_id = v_player1_id, status = 'completed', score = 'BYE' WHERE id = v_current_match_id;
        ELSIF v_player1_id IS NULL AND v_player2_id IS NOT NULL THEN
            UPDATE matches SET winner_id = v_player2_id, status = 'completed', score = 'BYE' WHERE id = v_current_match_id;
        END IF;
    END LOOP;

    -- Create subsequent rounds (placeholder matches)
    v_round := 2;
    WHILE v_current_round_matches_count > 1 LOOP
        v_current_round_matches_count := v_current_round_matches_count / 2;
        v_temp_match_ids := ARRAY[]::UUID[]; -- Reset for next round

        FOR i IN 1..v_current_round_matches_count LOOP
            INSERT INTO matches (bracket_id, round_number, match_number_in_round)
            VALUES (v_bracket_id, v_round, i)
            RETURNING id INTO v_next_round_match_id;

            v_temp_match_ids := array_append(v_temp_match_ids, v_next_round_match_id);
        END LOOP;

        -- Link previous round matches to current round placeholder matches
        FOR i IN 1..array_length(v_temp_match_ids, 1) LOOP
            -- Link player 1 slot
            UPDATE matches SET next_match_id = v_temp_match_ids[i], next_match_slot = 1
            WHERE id = v_temp_match_ids[2*i - 1];
            -- Link player 2 slot
            UPDATE matches SET next_match_id = v_temp_match_ids[i], next_match_slot = 2
            WHERE id = v_temp_match_ids[2*i];
        END LOOP;

        v_round := v_round + 1;
    END LOOP;

    -- Update tournament status
    UPDATE tournaments SET status = 'in_progress' WHERE id = p_tournament_id;

    RETURN TRUE;
END;
$$;


CREATE OR REPLACE FUNCTION report_score(p_match_id UUID, p_score_text TEXT, p_winner_id UUID)
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
    UPDATE matches
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
            UPDATE matches
            SET player1_id = p_winner_id
            WHERE id = v_next_match_id;
        ELSIF v_next_match_slot = 2 THEN
            UPDATE matches
            SET player2_id = p_winner_id
            WHERE id = v_next_match_id;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$;

