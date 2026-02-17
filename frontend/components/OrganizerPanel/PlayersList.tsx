import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import EmptyState from '../ui/EmptyState';
import AddPlayerModal from '../tournament/AddPlayerModal';

interface Player {
    id: string;
    email: string;
    seed_number: number | null;
    status: string;
}

interface PlayersListProps {
    tournamentId: string;
}

export default function PlayersList({ tournamentId }: PlayersListProps) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        loadPlayers();
    }, [tournamentId]);

    const loadPlayers = async () => {
        setLoading(true);
        try {
            // Fetch tournament registrations
            const { data: registrations, error } = await supabase
                .from('tournament_players_mccarren_tournament')
                .select(`
          player_id,
          seed_number,
          created_at
        `)
                .eq('tournament_id', tournamentId)
                .order('seed_number', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (!registrations) {
                setPlayers([]);
                return;
            }

            // Fetch generic user details mapping if possible, or use placeholder
            // Note: Since we don't have a public users table join, we really should fetch user emails 
            // from our admin API or if we have a profiles table. 
            // For now, we will just use the ID or stored metadata if available. 
            // But actually, AddPlayerModal fetches from /api/admin/users. We could do that here too to map IDs -> Emails properly.

            let userMap: Record<string, string> = {};
            try {
                const userRes = await fetch('/api/admin/users');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    userData.users?.forEach((u: any) => userMap[u.id] = u.email);
                }
            } catch (e) {
                console.warn('Could not fetch user details for mapping', e);
            }

            const mappedPlayers: Player[] = registrations.map((reg: any) => ({
                id: reg.player_id,
                email: userMap[reg.player_id] || `User ${reg.player_id.substring(0, 8)}...`,
                seed_number: reg.seed_number,
                status: 'registered'
            }));

            setPlayers(mappedPlayers);
        } catch (error) {
            console.error('Error loading players:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-tennis-navy-900">Registered Players</h3>
                    <span className="px-2.5 py-0.5 bg-tennis-navy-50 text-tennis-navy-700 text-xs font-bold rounded-full ring-1 ring-tennis-navy-100">
                        {players.length}
                    </span>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-tennis-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-tennis-green-700 transition-all hover:shadow-md"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Player
                </button>
            </div>

            <div className="card overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-24">
                                Seed
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Player
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-32">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {players.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12">
                                    <EmptyState
                                        title="No players yet"
                                        description="Add players to start the tournament."
                                    />
                                </td>
                            </tr>
                        ) : (
                            players.map((player) => (
                                <tr key={player.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {player.seed_number ? (
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-sm bg-tennis-green-100 text-tennis-green-800 text-xs font-bold border border-tennis-green-200">
                                                {player.seed_number}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 group-hover:text-slate-400 transition-colors">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-tennis-navy-50 text-tennis-navy-600 flex items-center justify-center text-xs font-bold border border-tennis-navy-100">
                                                {player.email.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900">{player.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                            Confirmed
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AddPlayerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                tournamentId={tournamentId}
                onPlayerAdded={loadPlayers}
            />
        </div>
    );
}
