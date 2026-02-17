# Implementation Plan - Automatic Draw Generation

We will implement the logic to automatically generate a single-elimination tournament bracket when the "Generate Draw" button is clicked.

## Goal
Replace the placeholder RPC call in `/api/generate-draw` with a robust TypeScript implementation that:
1.  Fetches registered players.
2.  Generates a balanced single-elimination bracket.
3.  Handles "Byes" correctly for player counts that aren't powers of 2.
4.  Saves the bracket and matches to Supabase.

## Proposed Changes

### 1. `frontend/app/api/generate-draw/route.ts`
**Current State**: Calls `supabaseAdmin.rpc('generate_draw_...').`
**New State**:
*   Fetch confirmed players from `tournament_players_mccarren_tournament`.
*   **Algorithm**:
    1.  Shuffle players randomly.
    2.  Calculate bracket size (nearest power of 2 >= player count).
    3.  Calculate number of byes.
    4.  Distribute byes as evenly as possible (or just at the top/bottom for simplicity in MVP).
    5.  Generate **Round 1** matches:
        *   Pair players.
        *   If `Player vs Bye` -> Auto-create "Bye" match (status: completed, winner: Player).
        *   If `Player vs Player` -> Create "Scheduled" match.
    6.  Generate **Subsequent Rounds** (placeholders):
        *   Create empty matches for R2, R3, ... Finals so the bracket view can render the path.
        *   Link matches (e.g., `next_match_id` or logical progression).
*   **Database Transaction**:
    *   Create `brackets_mccarren_tournament` record.
    *   Bulk insert generated `matches_mccarren_tournament`.
    *   Update Tournament status to `in_progress`.

### 2. `frontend/utils/tournament/drawGenerator.ts` (New Utility)
To keep the API route clean, we will create a helper class/function `generateSingleEliminationMatches(players)`.

## Verification Plan

### Automated/Manual Tests
*   **Test Case 1 (Power of 2)**: Register 4 players. Generate Draw. Verify 2 Semifinals, 1 Final.
*   **Test Case 2 (Odd Number)**: Register 3 players. Verify 1 Semifinal (Player vs Bye), 1 Semifinal (Player vs Player). *Wait, standard is R1 usually has byes.*
    *   *Correction*: With 3 players (Size 4).
    *   R1 (Semis):
        *   Match 1: P1 vs Bye (Winner P1)
        *   Match 2: P2 vs P3
    *   R2 (Final): Winner M1 vs Winner M2.
*   **Database Check**: Verify matches are inserted with correct `round_number` and `status`.
