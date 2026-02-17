'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AutoScheduleModal from './AutoScheduleModal';

export default function ScheduleActions({ tournamentId }: { tournamentId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-tennis-accent text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-tennis-accent-dark hover:shadow-lg transition-all flex items-center gap-2"
            >
                <span>📅</span>
                <span>Auto Schedule</span>
            </button>

            <AutoScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tournamentId={tournamentId}
                onScheduleComplete={() => {
                    router.refresh();
                }}
            />
        </>
    );
}
