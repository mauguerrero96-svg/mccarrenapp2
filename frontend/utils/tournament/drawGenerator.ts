export interface Player {
    id: string;
    email?: string;
    username?: string; // Helpful for display if email is private
}

export interface GeneratedMatch {
    id: string; // Pre-generated UUID
    round_number: number;
    match_number_in_round: number;
    player1_id: string | null;
    player2_id: string | null;
    status: 'scheduled' | 'completed' | 'bye';
    winner_id: string | null;
    score: string | null;
    next_match_id: string | null; // UUID of the next match
}

export function generateSingleEliminationMatches(players: Player[], seedingMode: 'random' | 'standard' = 'random'): GeneratedMatch[] {
    if (players.length < 2) return [];

    let orderedPlayers = [...players];

    if (seedingMode === 'random') {
        orderedPlayers.sort(() => Math.random() - 0.5);
    } else {
        // Standard Seeding Implementation (Fold Algorithm)
        // This ensures Seed 1 plays Seed N, Seed 2 plays Seed N-1, etc.
        // It recursively generates the seeding order for a power-of-2 bracket.

        const playerCount = players.length;
        const totalSlots = Math.pow(2, Math.ceil(Math.log2(playerCount)));

        let seeds = [1, 2];
        while (seeds.length < totalSlots) {
            const nextSeeds = [];
            const nextSize = seeds.length * 2;
            for (const seed of seeds) {
                nextSeeds.push(seed);
                nextSeeds.push(nextSize + 1 - seed);
            }
            seeds = nextSeeds;
        }

        const reordered: (Player | null)[] = [];
        for (const seedRank of seeds) {
            const playerIndex = seedRank - 1;
            if (playerIndex < orderedPlayers.length) {
                reordered.push(orderedPlayers[playerIndex]);
            } else {
                reordered.push(null); // Explicit Bye slot
            }
        }
        // We cast this to any[] or handle the nulls in logic below.
        // The type currently says Player[], so we must be careful.
        // Let's internally type it as (Player | null)[]
        orderedPlayers = reordered as any;
    }

    // Rename for consistency
    const sortedPlayers = orderedPlayers as (Player | null)[];

    let size = 2;
    // If Standard, sortedPlayers.length is ALREADY the power of 2 size (including nulls)
    if (seedingMode === 'standard') {
        size = sortedPlayers.length;
    } else {
        const playerCount = sortedPlayers.length;
        while (size < playerCount) {
            size *= 2;
        }
    }

    const matches: GeneratedMatch[] = [];
    const totalRounds = Math.log2(size);
    const round1MatchesCount = size / 2;
    const matchMap: Record<string, GeneratedMatch> = {};
    const getMatchKey = (r: number, m: number) => `${r}-${m}`;

    let currentRoundMatches = round1MatchesCount;
    for (let r = 1; r <= totalRounds; r++) {
        for (let m = 1; m <= currentRoundMatches; m++) {
            const matchId = crypto.randomUUID();
            const newMatch: GeneratedMatch = {
                id: matchId,
                round_number: r,
                match_number_in_round: m,
                player1_id: null,
                player2_id: null,
                status: 'scheduled',
                winner_id: null,
                score: null,
                next_match_id: null
            };
            matches.push(newMatch);
            matchMap[getMatchKey(r, m)] = newMatch;
        }
        currentRoundMatches /= 2;
    }

    matches.forEach(match => {
        if (match.round_number < totalRounds) {
            const nextRound = match.round_number + 1;
            const nextMatchNum = Math.ceil(match.match_number_in_round / 2);
            const nextMatch = matchMap[getMatchKey(nextRound, nextMatchNum)];
            if (nextMatch) {
                match.next_match_id = nextMatch.id;
            }
        }
    });

    // POPULATE ROUND 1
    const isExplicitSeeding = seedingMode === 'standard';

    if (isExplicitSeeding) {
        for (let i = 0; i < round1MatchesCount; i++) {
            const matchNum = i + 1;
            const match = matchMap[getMatchKey(1, matchNum)];

            const p1 = sortedPlayers[i * 2] || null;
            const p2 = sortedPlayers[(i * 2) + 1] || null;

            match.player1_id = p1 ? p1.id : null;
            match.player2_id = p2 ? p2.id : null;

            if (p1 && !p2) {
                match.status = 'completed';
                match.winner_id = p1.id;
                match.score = 'Bye';
                autoAdvance(matches, match, p1.id);
            } else if (!p1 && p2) {
                match.status = 'completed';
                match.winner_id = p2.id;
                match.score = 'Bye';
                autoAdvance(matches, match, p2.id);
            } else if (!p1 && !p2) {
                match.status = 'bye';
            }
        }
    } else {
        // Legacy Random (Collapse Byes)
        // Note: sortedPlayers here has NO nulls
        const actualPlayers = sortedPlayers.filter(p => p !== null) as Player[];

        const byesCount = size - actualPlayers.length;
        let playerIndex = 0;

        for (let i = 0; i < round1MatchesCount; i++) {
            const matchNum = i + 1;
            const match = matchMap[getMatchKey(1, matchNum)];

            let p1: Player | null = null;
            let p2: Player | null = null;
            let isByeMatch = false;

            if (i < byesCount) {
                if (playerIndex < actualPlayers.length) p1 = actualPlayers[playerIndex++];
                isByeMatch = true;
            } else {
                if (playerIndex < actualPlayers.length) p1 = actualPlayers[playerIndex++];
                if (playerIndex < actualPlayers.length) p2 = actualPlayers[playerIndex++];
            }

            match.player1_id = p1 ? p1.id : null;
            match.player2_id = p2 ? p2.id : null;

            if (isByeMatch && p1) {
                match.status = 'completed';
                match.winner_id = p1.id;
                match.score = 'Bye';
                autoAdvance(matches, match, p1.id);
            }
        }
    }

    return matches;
}

function autoAdvance(matches: GeneratedMatch[], match: GeneratedMatch, winnerId: string) {
    if (match.next_match_id) {
        const nextMatch = matches.find(m => m.id === match.next_match_id);
        if (nextMatch) {
            const isOdd = (match.match_number_in_round % 2 !== 0);
            if (isOdd) {
                nextMatch.player1_id = winnerId;
            } else {
                nextMatch.player2_id = winnerId;
            }
        }
    }
}
