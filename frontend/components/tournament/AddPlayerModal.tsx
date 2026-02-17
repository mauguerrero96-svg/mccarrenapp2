'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { supabase } from '../../utils/supabase/client';

interface User {
    id: string;
    email: string;
}

interface AddPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    tournamentId: string;
    onPlayerAdded: () => void;
}

import CreateUserModal from '../admin/CreateUserModal';

export default function AddPlayerModal({ isOpen, onClose, tournamentId, onPlayerAdded }: AddPlayerModalProps) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [seed, setSeed] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setSeed('');
            setSelectedUserId('');
            setError(null);
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            // Fetch all users to populate the dropdown
            // In a real app with many users, this should be a search endpoint
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleUserCreated = async () => {
        // Refresh list and optionally try to select the new user (would need to know ID, 
        // but simplest is just refreshing for now or grabbing last created if sorted)
        await fetchUsers();
        // Since list is likely sorted by creation or just ID, the new user is in the list.
        // We could pass the new user ID from the modal callback if we updated it, but fine for now.
    };

    const handleSubmit = async () => {
        if (!selectedUserId) {
            setError('Please select a player');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase
                .from('tournament_players_mccarren_tournament')
                .insert({
                    tournament_id: tournamentId,
                    player_id: selectedUserId,
                    seed_number: seed ? parseInt(seed) : null,
                    status: 'registered' // Default
                });

            if (insertError) {
                // Check for duplicate key error logic if needed, usually code '23505'
                if (insertError.code === '23505') {
                    throw new Error('Player is already registered for this tournament.');
                }
                throw insertError;
            }

            onPlayerAdded();
            onClose();
        } catch (err: any) {
            console.error('Error adding player:', err);
            setError(err.message || 'Failed to add player');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Add Player to Tournament" size="md">
                <div className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-semibold text-tennis-navy-700">
                                Select Player
                            </label>
                            <button
                                onClick={() => setIsCreateUserOpen(true)}
                                className="text-xs font-semibold text-tennis-green-600 hover:text-tennis-green-700 hover:underline"
                            >
                                + Create New User
                            </button>
                        </div>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:border-tennis-green-500 focus:ring-tennis-green-500 text-sm py-2.5"
                        >
                            <option value="">-- Choose a user --</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.email}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            Only registered platform users can be added.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-tennis-navy-700 mb-1">
                            Seed Number (Optional)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            placeholder="e.g. 1"
                            className="w-full border-slate-300 rounded-lg shadow-sm focus:border-tennis-green-500 focus:ring-tennis-green-500 text-sm py-2.5"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 bg-tennis-green-600 text-white font-medium rounded-lg hover:bg-tennis-green-700 disabled:opacity-50 shadow-sm transition-all hover:shadow"
                        >
                            {loading ? 'Adding...' : 'Add Player'}
                        </button>
                    </div>
                </div>
            </Modal>

            <CreateUserModal
                isOpen={isCreateUserOpen}
                onClose={() => setIsCreateUserOpen(false)}
                onUserCreated={handleUserCreated}
            />
        </>
    );
}
