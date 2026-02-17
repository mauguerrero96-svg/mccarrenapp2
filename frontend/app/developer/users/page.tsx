'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase/client';
import Link from 'next/link';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    // In a real app, we'd fetch this from via a secure API route because
    // client-side 'supabase.auth.admin' works only with service role key (unsafe).
    // For now, I will create a simple API route to fetch/update users.
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/developer/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data.users);
        } catch (err: any) {
            setMessage('Error loading users: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        setMessage('Updating role...');
        try {
            const res = await fetch('/api/developer/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });

            if (!res.ok) throw new Error('Failed to update role');

            setMessage(`Role updated to ${newRole} successfully.`);
            fetchUsers(); // Refresh list
        } catch (err: any) {
            setMessage('Error updating role: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/developer" className="text-xl hover:scale-110 transition-transform">←</Link>
                        <h1 className="font-bold text-lg text-white tracking-tight">User Management</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {message && (
                    <div className={`mb-6 p-4 rounded border ${message.includes('Error') ? 'bg-red-900/20 border-red-800' : 'bg-emerald-900/20 border-emerald-800'}`}>
                        {message}
                    </div>
                )}

                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950 text-slate-400 uppercase font-medium border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading users...</td></tr>
                                ) : users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{u.email}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{u.id}</td>
                                        <td className="px-6 py-4 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${u.user_metadata?.user_role === 'developer' ? 'bg-purple-500/10 text-purple-400' :
                                                    u.user_metadata?.user_role === 'admin' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {u.user_metadata?.user_role || 'player'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    value={u.user_metadata?.user_role || 'player'}
                                                    onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                >
                                                    <option value="player">Player</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="developer">Developer</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
