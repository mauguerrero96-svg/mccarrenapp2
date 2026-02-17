'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

export default function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('player');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            onUserCreated();
            onClose();
            // Reset form
            setEmail('');
            setPassword('');
            setRole('player');
        } catch (err: any) {
            console.error('Error creating user:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New User" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-tennis-navy-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border-slate-300 rounded-lg shadow-sm focus:border-tennis-green-500 focus:ring-tennis-green-500"
                        placeholder="player@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-tennis-navy-700 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-slate-300 rounded-lg shadow-sm focus:border-tennis-green-500 focus:ring-tennis-green-500"
                        placeholder="••••••••"
                    />
                    <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters.</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-tennis-navy-700 mb-1">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full border-slate-300 rounded-lg shadow-sm focus:border-tennis-green-500 focus:ring-tennis-green-500"
                    >
                        <option value="player">Player</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-tennis-green-600 text-white font-medium rounded-lg hover:bg-tennis-green-700 disabled:opacity-50 shadow-sm transition-all hover:shadow"
                    >
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
