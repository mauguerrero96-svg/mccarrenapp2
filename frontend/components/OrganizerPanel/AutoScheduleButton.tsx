import { useState } from 'react';
import AutoScheduleModal from '../tournament/AutoScheduleModal';

interface AutoScheduleButtonProps {
    tournamentId: string;
    onScheduleComplete?: () => void;
}

export default function AutoScheduleButton({
    tournamentId,
    onScheduleComplete
}: AutoScheduleButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white text-tennis-navy-700 border border-slate-200 hover:border-tennis-green-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg text-sm py-2 px-4 flex items-center gap-2 shadow-sm transition-all duration-200"
                    title="Automatically assign times and courts"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Auto Schedule</span>
                </button>
            </div>

            <AutoScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tournamentId={tournamentId}
                onScheduleComplete={() => {
                    if (onScheduleComplete) onScheduleComplete();
                }}
            />
        </>
    );
}
