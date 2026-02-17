'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function MatchScheduler({ match }: { match: any }) {
    // const supabase = createClient(); // Removed, using singleton
    const [startTime, setStartTime] = useState(match.start_time ? new Date(match.start_time).toISOString().slice(0, 16) : '');
    const [court, setCourt] = useState(match.court || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        const { error } = await supabase
            .from('matches_mccarren_tournament')
            .update({
                start_time: startTime || null,
                court: court || null
            })
            .eq('id', match.id);

        setSaving(false);

        if (error) {
            alert('Failed to update schedule');
            console.error(error);
        } else {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow-md transition-shadow">
            {/* Match Info */}
            <div className="flex-1 min-w-[200px]">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                    Match {match.match_number || '?'}
                </div>
                <div className="flex flex-col gap-1">
                    <div className="font-semibold text-gray-800">
                        {match.player1_id ? 'P1 (Loaded)' : 'TBD'} <span className="text-gray-400 font-normal">vs</span> {match.player2_id ? 'P2 (Loaded)' : 'TBD'}
                    </div>
                    {/* Note: We assume caller might enrich names, otherwise we assume IDs or "TBD" */}
                    <div className="text-xs text-gray-500">
                        {match.score_text || 'No score'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 items-center flex-1">
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs text-gray-500">Time</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    />
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs text-gray-500">Court</label>
                    <select
                        value={court}
                        onChange={(e) => setCourt(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    >
                        <option value="">Select Court...</option>
                        <option value="Court 1">Court 1</option>
                        <option value="Court 2">Court 2</option>
                        <option value="Court 3">Court 3</option>
                        <option value="Court 4">Court 4</option>
                        <option value="Show Court">Show Court</option>
                    </select>
                </div>
            </div>

            {/* Action */}
            <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all min-w-[80px] ${saved
                    ? 'bg-green-100 text-green-700'
                    : 'bg-tennis-navy text-white hover:bg-black'
                    }`}
            >
                {saving ? '...' : saved ? 'Saved' : 'Save'}
            </button>
        </div>
    );
}
