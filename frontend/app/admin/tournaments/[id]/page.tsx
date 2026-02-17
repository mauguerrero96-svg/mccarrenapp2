import Link from 'next/link';
import { createClient } from '../../../../utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Tournament Details
    const { data: tournament, error } = await supabase
        .from('tournaments_mccarren_tournament')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !tournament) {
        notFound();
    }

    return (
        <div className="container mx-auto py-12 px-4">
            {/* Header */}
            <div className="mb-10">
                <Link href="/tournaments" className="text-gray-400 hover:text-tennis-navy mb-4 inline-block text-sm font-medium">
                    &larr; Back to Tournaments
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-tennis-navy mb-2">{tournament.name}</h1>
                        <p className="text-gray-500">
                            {new Date(tournament.start_date).toLocaleDateString()} &mdash;
                            <span className="capitalize ml-1">{tournament.status.replace('_', ' ')}</span>
                        </p>
                    </div>
                    {/* Potential Status Toggle could go here */}
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Draw / Bracket */}
                <Link href={`/admin/tournaments/${id}/draw`} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-tennis-accent/20">
                    <div className="w-12 h-12 bg-tennis-green/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                        🏆
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Bracket & Draw</h2>
                    <p className="text-gray-500 text-sm mb-4">Generate matches, view the bracket, and enter scores.</p>
                    <span className="text-tennis-accent font-bold text-sm group-hover:translate-x-1 inline-block transition-transform">Manage Draw &rarr;</span>
                </Link>

                {/* 2. Scheduler */}
                <Link href={`/admin/tournaments/${id}/schedule`} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-tennis-accent/20">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                        📅
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Scheduler</h2>
                    <p className="text-gray-500 text-sm mb-4">Assign match times and court allocations.</p>
                    <span className="text-tennis-accent font-bold text-sm group-hover:translate-x-1 inline-block transition-transform">Open Scheduler &rarr;</span>
                </Link>

                {/* 3. Players */}
                <Link href={`/admin/tournaments/${id}/players`} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-tennis-accent/20">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                        👥
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Players & Seeding</h2>
                    <p className="text-gray-500 text-sm mb-4">Manage registrations, add participants, and set seeds.</p>
                    <span className="text-tennis-accent font-bold text-sm group-hover:translate-x-1 inline-block transition-transform">Manage Players &rarr;</span>
                </Link>

            </div>
        </div>
    );
}
