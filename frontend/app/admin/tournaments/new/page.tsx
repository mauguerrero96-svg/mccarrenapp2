'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContainer';

export default function NewTournamentPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [clubs, setClubs] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        club_id: '',
        start_date: '',
        max_players: 32,
        competition_type: 'singles', // 'singles' | 'doubles'
    });

    useEffect(() => {
        async function loadClubs() {
            const { data } = await supabase.from('clubs_mccarren_tournament').select('id, name').order('name');
            if (data) setClubs(data);
        }
        loadClubs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('tournaments_mccarren_tournament')
                .insert([{
                    name: formData.name,
                    club_id: formData.club_id,
                    start_date: formData.start_date || null,
                    max_players: formData.max_players,
                    competition_type: formData.competition_type,
                    status: 'draft'
                }])
                .select()
                .single();

            if (error) throw error;

            showToast('Tournament created successfully!', 'success');
            router.push('/tournaments');
            router.refresh();
        } catch (error: any) {
            console.error('Error creating tournament:', error);
            showToast(error.message || 'Failed to create tournament', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Create New Tournament</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border">

                <FormField label="Tournament Name" required>
                    <Input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Summer Cup 2025"
                        required
                        className="focus:border-tennis-green-500 focus:ring-tennis-green-200"
                    />
                </FormField>

                <FormField label="Club" required>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tennis-green-500 focus:border-tennis-green-500 focus:outline-none transition-all"
                        value={formData.club_id}
                        onChange={e => setFormData({ ...formData, club_id: e.target.value })}
                        required
                    >
                        <option value="">Select a Club</option>
                        {clubs.map(club => (
                            <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                    </select>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Competition Type">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tennis-green-500 focus:border-tennis-green-500 focus:outline-none transition-all"
                            value={formData.competition_type}
                            onChange={e => setFormData({ ...formData, competition_type: e.target.value })}
                        >
                            <option value="singles">Singles</option>
                            <option value="doubles">Doubles</option>
                        </select>
                    </FormField>

                    <FormField label="Max Players/Pairs">
                        <Input
                            type="number"
                            value={formData.max_players}
                            onChange={e => setFormData({ ...formData, max_players: parseInt(e.target.value) })}
                            min={2}
                            max={128}
                            className="focus:border-tennis-green-500 focus:ring-tennis-green-200"
                        />
                    </FormField>
                </div>

                <FormField label="Start Date">
                    <Input
                        type="date"
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        className="focus:border-tennis-green-500 focus:ring-tennis-green-200"
                    />
                </FormField>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Creating...' : 'Create Tournament'}
                    </button>
                </div>

            </form>
        </div>
    );
}
