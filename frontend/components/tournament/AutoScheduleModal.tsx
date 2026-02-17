'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';

interface AutoScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    tournamentId: string;
    onScheduleComplete: () => void;
}

export default function AutoScheduleModal({ isOpen, onClose, tournamentId, onScheduleComplete }: AutoScheduleModalProps) {
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [courtsCount, setCourtsCount] = useState<number | ''>(4);
    const [matchDuration, setMatchDuration] = useState<number | ''>(90);
    const [startHour, setStartHour] = useState<number | ''>(9);

    const handleRunSchedule = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auto-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tournament_id: tournamentId,
                    start_date: startDate,
                    courts_count: courtsCount === '' ? 4 : courtsCount,
                    match_duration: matchDuration === '' ? 90 : matchDuration,
                    daily_start_hour: startHour === '' ? 9 : startHour
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            alert(`Successfully scheduled ${data.updated} matches!`);
            onScheduleComplete();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(`Error scheduling: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Auto-Schedule Matches" size="md">
            <div className="space-y-4">
                <p className="text-sm text-gray-500">
                    Configure the auto-scheduler. This will overwrite existing times for scheduled matches.
                </p>

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tennis-accent"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Courts */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Courts</label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={courtsCount}
                            onChange={(e) => setCourtsCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tennis-accent"
                        />
                    </div>

                    {/* Start Hour */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Hour (24h)</label>
                        <input
                            type="number"
                            min={0}
                            max={23}
                            value={startHour}
                            onChange={(e) => setStartHour(e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tennis-accent"
                        />
                    </div>
                </div>

                {/* Duration */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Match Duration (minutes)</label>
                    <input
                        type="number"
                        step={15}
                        min={30}
                        value={matchDuration}
                        onChange={(e) => setMatchDuration(e.target.value === '' ? '' : parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tennis-accent"
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRunSchedule}
                        disabled={loading}
                        className="px-4 py-2 bg-tennis-accent text-white font-medium rounded-lg hover:bg-tennis-accent-dark disabled:opacity-50 shadow-sm"
                    >
                        {loading ? 'Scheduling...' : 'Run Auto Schedule'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
