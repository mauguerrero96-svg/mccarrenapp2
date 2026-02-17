// Server Component for Draw Page

import BracketView from '@/components/tournament/BracketView';

export default async function TournamentDrawPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tournament Draw</h1>
                    <p className="text-slate-500 mt-2">Manage matches and view the bracket.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
                <BracketView tournamentId={id} isAdmin={true} />
            </div>
        </div>
    );
}
