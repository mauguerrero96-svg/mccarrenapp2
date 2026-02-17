'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';

interface Match {
    id: string;
    round_number: number;
    match_number: number;
    player1_id: string | null;
    player2_id: string | null;
    winner_id: string | null;
    score_text: string | null;
    // enriched
    player1_name?: string;
    player2_name?: string;
}

interface MatchScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    match: Match;
    onUpdate: () => void; // Trigger refetch
}

export default function MatchScoreModal({ isOpen, onClose, match, onUpdate }: MatchScoreModalProps) {
    const [winnerId, setWinnerId] = useState<string>(match.winner_id || '');
    const [score, setScore] = useState<string>(match.score_text || '');
    const [saving, setSaving] = useState(false);

    // Derive names
    const p1Name = match.player1_name || 'Player 1';
    const p2Name = match.player2_name || 'Player 2';
    const p1Id = match.player1_id;
    const p2Id = match.player2_id;

    const handleSave = async () => {
        if (!winnerId) return; // Must select winner

        setSaving(true);
        try {
            const res = await fetch('/api/matches/update', {
                method: 'POST',
                body: JSON.stringify({
                    match_id: match.id,
                    winner_id: winnerId,
                    score_text: score
                })
            });

            if (!res.ok) throw new Error('Failed to update match');

            onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to save result. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Match Result - Round ${match.round_number}`} size="md">
            <div className="flex flex-col gap-6">

                {/* Winner Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Winner *</label>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Player 1 Option */}
                        <button
                            disabled={!p1Id}
                            onClick={() => p1Id && setWinnerId(p1Id)}
                            className={`p-4 border rounded-xl flex flex-col items-center transition-all ${winnerId === p1Id ? 'border-tennis-accent bg-tennis-green-50 ring-1 ring-tennis-accent' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-tennis-navy text-white flex items-center justify-center font-bold mb-2">P1</div>
                            <span className="font-medium text-gray-900">{p1Name}</span>
                        </button>

                        {/* Player 2 Option */}
                        <button
                            disabled={!p2Id}
                            onClick={() => p2Id && setWinnerId(p2Id)}
                            className={`p-4 border rounded-xl flex flex-col items-center transition-all ${winnerId === p2Id ? 'border-tennis-accent bg-tennis-green-50 ring-1 ring-tennis-accent' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-tennis-navy text-white flex items-center justify-center font-bold mb-2">P2</div>
                            <span className="font-medium text-gray-900">{p2Name}</span>
                        </button>
                    </div>
                </div>

                {/* Score Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                    <input
                        type="text"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder="e.g. 6-4, 6-2"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tennis-accent focus:border-transparent outline-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!winnerId || saving}
                        onClick={handleSave}
                        className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${!winnerId || saving ? 'bg-gray-300 cursor-not-allowed' : 'bg-tennis-accent hover:bg-tennis-accent-dark shadow-md hover:shadow-lg'}`}
                    >
                        {saving ? 'Saving...' : 'Save Result'}
                    </button>
                </div>

            </div>
        </Modal>
    );
}
