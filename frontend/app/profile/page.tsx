'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        ntrpLevel: '',
        club: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Real User: Fetch from profile (mocked here for now as we might not have a full profile table set up in frontend fetch)
                // In a real app, we'd fetch from a 'profiles' table.
                // For now, let's use metadata or placeholders.
                setFormData({
                    firstName: user.user_metadata?.full_name?.split(' ')[0] || '',
                    lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                    email: user.email || '',
                    phone: '',
                    ntrpLevel: '4.0',
                    club: 'Mccarren Tennis Center'
                });
            } else {
                // Demo User
                setIsDemo(true);
                setFormData({
                    firstName: 'Demo',
                    lastName: 'Player',
                    email: 'demo@player.com',
                    phone: '555-0123',
                    ntrpLevel: '4.5',
                    club: 'McCarren Tennis Center'
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isDemo) {
            alert('Profile updated! (Demo Mode - changes not saved to server)');
        } else {
            // Real update logic would go here
            alert('Profile updated!');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-tennis-navy-900 tracking-tight">
                            My Profile
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Manage your personal information and tennis preferences.
                        </p>
                    </div>
                    <Button href="/dashboard" variant="secondary">
                        Back to Dashboard
                    </Button>
                </div>

                {isDemo && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <span>ℹ️</span>
                        <span className="text-sm font-medium">You are viewing this profile in Demo Mode. Changes will not be saved.</span>
                    </div>
                )}

                <Card padding="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isDemo} // Prevent real users from changing email easily
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">NTRP Level</label>
                                <select
                                    name="ntrpLevel"
                                    value={formData.ntrpLevel}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select Level</option>
                                    <option value="3.0">3.0</option>
                                    <option value="3.5">3.5</option>
                                    <option value="4.0">4.0</option>
                                    <option value="4.5">4.5</option>
                                    <option value="5.0">5.0+</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Home Club</label>
                            <input
                                type="text"
                                name="club"
                                value={formData.club}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <Button type="submit" isLoading={saving}>
                                Save Changes
                            </Button>
                        </div>

                    </form>
                </Card>
            </div>
        </div>
    );
}
