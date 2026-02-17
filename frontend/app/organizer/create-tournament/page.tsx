'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  user_metadata: {
    user_role: string;
  };
}

interface Club {
  id: string;
  name: string;
}

export default function CreateTournamentPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    club_id: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_players: '',
    seeding_mode: 'random'
  });
  const router = useRouter();

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    const { data, error } = await supabase
      .from('clubs_mccarren_tournament')
      .select('id, name')
      .order('name');

    if (!error && data) {
      setClubs(data);
      // Si hay clubs, seleccionar el primero por defecto
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, club_id: data[0].id }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tournamentData = {
        name: formData.name,
        club_id: formData.club_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        registration_deadline: formData.registration_deadline || null,
        max_players: formData.max_players ? parseInt(formData.max_players) : null,
        seeding_mode: formData.seeding_mode,
        status: 'registration_open'
      };

      const { data, error } = await supabase
        .from('tournaments_mccarren_tournament')
        .insert([tournamentData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Redirigir al panel del organizador
      router.push('/organizer?success=tournament_created');
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      alert(`Error al crear el torneo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 mb-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/organizer" className="text-slate-500 hover:text-emerald-700 flex items-center space-x-2 text-sm font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Tournament</h1>
                <p className="text-sm text-slate-500 font-medium">Set up your tennis tournament</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-amber-200">
                Development Mode
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Tournament Details
          </h2>
          <p className="text-slate-600">
            Configure all the details for your tennis tournament. Fields marked with * are required.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-base font-semibold text-slate-900">
              General Information
            </h3>
          </div>
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre del Torneo */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                  placeholder="e.g. Summer Open 2024"
                />
              </div>

              {/* Club */}
              <div>
                <label htmlFor="club_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Host Club *
                </label>
                <div className="relative">
                  <select
                    name="club_id"
                    id="club_id"
                    required
                    value={formData.club_id}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 appearance-none"
                  >
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    id="start_date"
                    required
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-slate-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    id="end_date"
                    required
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* Deadline y Max Players */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="registration_deadline" className="block text-sm font-medium text-slate-700 mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="registration_deadline"
                    id="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                  />
                </div>

                <div>
                  <label htmlFor="max_players" className="block text-sm font-medium text-slate-700 mb-1">
                    Max Players
                  </label>
                  <input
                    type="number"
                    name="max_players"
                    id="max_players"
                    min="2"
                    max="128"
                    value={formData.max_players}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                    placeholder="e.g. 32"
                  />
                </div>
              </div>

              {/* Seeding Mode */}
              <div>
                <label htmlFor="seeding_mode" className="block text-sm font-medium text-slate-700 mb-1">
                  Seeding Method
                </label>
                <select
                  name="seeding_mode"
                  id="seeding_mode"
                  value={formData.seeding_mode}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                >
                  <option value="random">Random</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                <Link
                  href="/organizer"
                  className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all duration-200"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>Create Tournament</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}