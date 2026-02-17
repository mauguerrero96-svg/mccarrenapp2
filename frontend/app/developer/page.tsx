'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase/client';

export default function DeveloperDashboard() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
        router.refresh();
    };

    useEffect(() => {

        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                Loading Developer Console...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono">
            {/* Top Bar */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">👨‍💻</span>
                        <h1 className="font-bold text-lg text-white tracking-tight">McC Developer Console</h1>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                        <span className="text-emerald-400">● System Online</span>
                        <div className="h-4 w-px bg-slate-700"></div>
                        <span>{user?.email}</span>
                        <Link href="/dashboard" className="hover:text-white transition-colors">Exit to App</Link>
                        <button
                            onClick={handleSignOut}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-md transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10">

                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-white mb-2">System Overview</h2>
                    <p className="text-slate-400">Full operational control and monitoring.</p>
                </div>

                {/* Quick Access Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

                    {/* Admin Bypass */}
                    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Admin Dashboard</h3>
                        <p className="text-sm text-slate-500 mb-4">Access the main tournament management interface as an Admin.</p>
                        <Link href="/admin" className="inline-flex items-center text-sm font-bold text-indigo-400 hover:text-indigo-300">
                            Launch Console &rarr;
                        </Link>
                    </div>

                    {/* User Simulation */}
                    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Player View</h3>
                        <p className="text-sm text-slate-500 mb-4">Experience the application exactly as a standard player would.</p>
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-emerald-400 hover:text-emerald-300">
                            Open Dashboard &rarr;
                        </Link>
                    </div>

                    {/* Database / Supabase */}
                    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Database Access</h3>
                        <p className="text-sm text-slate-500 mb-4">Direct link to Supabase project settings (External).</p>
                        <a href="https://supabase.com/dashboard" target="_blank" className="inline-flex items-center text-sm font-bold text-amber-400 hover:text-amber-300">
                            Open Supabase &nearr;
                        </a>
                    </div>
                </div>

                {/* System Logs (Mock) */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                        <h3 className="font-bold text-white">System Logs</h3>
                        <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live</span>
                    </div>

                    <div className="p-6 font-mono text-sm leading-relaxed">
                        <div className="space-y-2">
                            <div className="flex gap-4">
                                <span className="text-slate-500">[12:05:12]</span>
                                <span className="text-emerald-400">INFO</span>
                                <span className="text-slate-300">System initialized. RBAC policies active.</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-slate-500">[12:05:10]</span>
                                <span className="text-emerald-400">INFO</span>
                                <span className="text-slate-300">Developer session authenticated: {user?.id}</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-slate-500">[12:04:45]</span>
                                <span className="text-blue-400">DEBUG</span>
                                <span className="text-slate-300">Middleware routing checks passed.</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-slate-500">[12:04:00]</span>
                                <span className="text-amber-400">WARN</span>
                                <span className="text-slate-300">High latency detected on tournament_fetch (200ms).</span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
