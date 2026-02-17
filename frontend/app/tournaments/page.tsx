import Link from 'next/link';
import { createClient } from '../../utils/supabase/server';

export default async function TournamentsPage() {
  const supabase = await createClient();
  const { data: tournaments, error } = await supabase
    .from('tournaments_mccarren_tournament')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Error loading tournaments: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-tennis-navy mb-2 tracking-tight">Tournaments</h1>
          <p className="text-gray-500 text-lg">Manage your tournaments and schedules</p>
        </div>
        <Link
          href="/admin/tournaments/new"
          className="bg-tennis-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-tennis-accent-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          + New Tournament
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tournaments?.map((t) => (
          <Link
            key={t.id}
            href={`/admin/tournaments/${t.id}`}
            className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-tennis-accent"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${t.status === 'registration_open' ? 'bg-green-100 text-green-700' :
                  t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                }`}>
                {t.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {new Date(t.created_at).toLocaleDateString()}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-tennis-accent transition-colors">
              {t.name}
            </h2>

            <div className="flex items-center text-sm text-gray-500 mb-6">
              <span className="mr-4">📍 {t.club_id ? 'Mccarren Park' : 'TBD'}</span>
              <span>👥 {t.max_players || 32} Players</span>
            </div>

            <div className="flex items-center text-tennis-accent font-bold text-sm group-hover:translate-x-2 transition-transform">
              Manage Tournament &rarr;
            </div>
          </Link>
        ))}

        {(!tournaments || tournaments.length === 0) && (
          <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg mb-4">No tournaments found.</p>
            <button className="text-tennis-accent font-bold hover:underline">Create your first tournament</button>
          </div>
        )}
      </div>
    </div>
  );
}