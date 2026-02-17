'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/ToastContainer';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Tournament Management',
    allowPublicRegistration: true,
    requireEmailConfirmation: true,
    maxTournamentsPerClub: 10,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!settings.siteName.trim()) {
      newErrors.siteName = 'Site name is required';
    }
    if (settings.maxTournamentsPerClub < 1) {
      newErrors.maxTournamentsPerClub = 'Must be at least 1';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    try {
      // TODO: Implement actual settings save via API
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      showToast('Error saving settings', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure system settings and preferences</p>
      </div>


      {/* General Settings */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <FormField label="Site Name" required error={errors.siteName}>
            <Input
              type="text"
              value={settings.siteName}
              onChange={(e) => {
                setSettings({ ...settings, siteName: e.target.value });
                if (errors.siteName) {
                  setErrors({ ...errors, siteName: '' });
                }
              }}
              error={!!errors.siteName}
            />
          </FormField>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allow Public Registration
              </label>
              <p className="text-sm text-gray-500">
                Allow users to register without invitation
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowPublicRegistration}
                onChange={(e) =>
                  setSettings({ ...settings, allowPublicRegistration: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Require Email Confirmation
              </label>
              <p className="text-sm text-gray-500">
                Users must confirm their email before accessing the system
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireEmailConfirmation}
                onChange={(e) =>
                  setSettings({ ...settings, requireEmailConfirmation: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
            </label>
          </div>

          <FormField
            label="Max Tournaments Per Club"
            required
            error={errors.maxTournamentsPerClub}
            hint="Maximum number of tournaments a club can have simultaneously"
          >
            <Input
              type="number"
              value={settings.maxTournamentsPerClub}
              onChange={(e) => {
                setSettings({ ...settings, maxTournamentsPerClub: parseInt(e.target.value) || 0 });
                if (errors.maxTournamentsPerClub) {
                  setErrors({ ...errors, maxTournamentsPerClub: '' });
                }
              }}
              min="1"
              error={!!errors.maxTournamentsPerClub}
            />
          </FormField>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
