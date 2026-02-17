const { generateSingleEliminationMatches } = require('./frontend/utils/tournament/drawGenerator_test_wrapper');

// Mock players with specific IDs that look like ranks
const players = [
    { id: '1', username: 'Seed 1' },
    { id: '2', username: 'Seed 2' },
    { id: '3', username: 'Seed 3' },
    { id: '4', username: 'Seed 4' },
    { id: '5', username: 'Seed 5' },
    { id: '6', username: 'Seed 6' },
    { id: '7', username: 'Seed 7' },
    { id: '8', username: 'Seed 8' }
];

console.log('--- Testing Random Seeding ---');
const randomMatches = generateSingleEliminationMatches([...players], 'random');
const r1_random = randomMatches.filter(m => m.round_number === 1);
console.log('Random Round 1 Matches:', r1_random.map(m => `(${m.player1_id} vs ${m.player2_id})`).join(', '));

console.log('\n--- Testing Standard Seeding (Current) ---');
const standardMatches = generateSingleEliminationMatches([...players], 'standard');
const r1_standard = standardMatches.filter(m => m.round_number === 1);
console.log('Standard Round 1 Matches:', r1_standard.map(m => `(${m.player1_id} vs ${m.player2_id})`).join(', '));

// EXPECTED "PROPER" TENNIS SEEDING for 8 players:
// (1 vs 8), (4 vs 5), (3 vs 6), (2 vs 7) <-- Order might vary but pairings should be these.
// CURRENT IMPLEMENTATION EXPECTATION (Input Order):
// (1 vs 2), (3 vs 4), (5 vs 6), (7 vs 8) <-- BAD!
