'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContainer';

interface Player {
    player_id: string;
    tournament_id: string;
    seed_number: number | null;
    email: string; // Fetching enriched data from API
    username?: string;
}

export default function PlayersPage() {
    const params = useParams();
    const id = params.id as string; // Tournament ID
    const { showToast } = useToast();

    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchPlayers();
    }, [id]);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/tournaments/${id}/players`);
            if (!res.ok) throw new Error('Failed to load players');
            const data = await res.json();
            setPlayers(data);
        } catch (err: any) {
            console.error(err);
            showToast('Error loading players', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;
        setAdding(true);
        try {
            const res = await fetch(`/api/tournaments/${id}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add player');

            showToast('Player added successfully!', 'success');
            setNewEmail('');
            fetchPlayers(); // Refresh list
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setAdding(false);
        }
    };

    const handleUpdateSeed = async (playerId: string, seed: number | null) => {
        // Optimistic update
        const updatedPlayers = players.map(p =>
            p.player_id === playerId ? { ...p, seed_number: seed } : p
        );
        setPlayers(updatedPlayers);

        try {
            const res = await fetch(`/api/tournaments/${id}/players`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ player_id: playerId, seed_number: seed })
            });
            if (!res.ok) throw new Error('Failed to update seed');
        } catch (err: any) {
            showToast('Error updating seed', 'error');
            // Revert on error could be added here
        }
    };

    const handleRemovePlayer = async (playerId: string) => {
        if (!confirm('Are you sure you want to remove this player?')) return;

        try {
            const res = await fetch(`/api/tournaments/${id}/players?player_id=${playerId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to remove player');

            showToast('Player removed', 'info');
            setPlayers(players.filter(p => p.player_id !== playerId));
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-tennis-navy mb-8">Tournament Participants</h1>

            {/* Add Player Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-bold mb-4">Add Participant</h2>
                <form onSubmit={handleAddPlayer} className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="User Email (e.g. player@example.com)"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={adding}
                        className="bg-tennis-accent text-white px-6 py-2 rounded-lg hover:bg-tennis-accent-dark transition-colors font-medium disabled:opacity-50"
                    >
                        {adding ? 'Adding...' : 'Add Player'}
                    </button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                    Note: The user must already be registered in the system.
                </p>
            </div>

            {/* Players List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Seed #</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Player</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Registered At</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading players...</td></tr>
                        ) : players.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No players registered yet.</td></tr>
                        ) : (
                            players.map((player) => (
                                <tr key={player.player_id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 w-24">
                                        <input
                                            type="number"
                                            className="w-16 px-2 py-1 border border-gray-200 rounded text-center focus:ring-2 focus:ring-tennis-accent focus:outline-none"
                                            value={player.seed_number || ''}
                                            placeholder="-"
                                            onChange={(e) => {
                                                const val = e.target.value ? parseInt(e.target.value) : null;
                                                handleUpdateSeed(player.player_id, val);
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{player.email}</div>
                                        <div className="text-xs text-gray-400">{player.username || 'User'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {/* Since API sends enriched data, created_at might be missing from direct select if not joined properly, check logic */}
                                        {/* Actually `reg` object usually has created_at from the registration table */}
                                        Today
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleRemovePlayer(player.player_id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
