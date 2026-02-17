'use client';

import { useEffect, useState } from 'react';

export default function ClientHome() {
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: false,
    supabaseKey: false
  });

  useEffect(() => {
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Tournament Management
          </h1>
          <p className="text-gray-600 text-lg">
            Organize and manage tennis tournaments efficiently
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
          <div className={`p-6 bg-white rounded-lg border shadow-sm ${envStatus.supabaseUrl ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${envStatus.supabaseUrl ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              <div>
                <h3 className="font-medium text-gray-900">Database</h3>
                <p className="text-sm text-gray-600">
                  {envStatus.supabaseUrl ? 'Connected' : 'Not configured'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 bg-white rounded-lg border shadow-sm ${envStatus.supabaseKey ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${envStatus.supabaseKey ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              <div>
                <h3 className="font-medium text-gray-900">API Keys</h3>
                <p className="text-sm text-gray-600">
                  {envStatus.supabaseKey ? 'Configured' : 'Not configured'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <a
            href="/dashboard"
            className="group p-8 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow border-gray-200 hover:border-gray-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard</h3>
              <p className="text-gray-600 text-sm">Overview and analytics</p>
            </div>
          </a>

          <a
            href="/tournaments"
            className="group p-8 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow border-gray-200 hover:border-gray-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tournaments</h3>
              <p className="text-gray-600 text-sm">Manage draws & schedules.</p>
            </div>
          </a>

          <a
            href="/test"
            className="group p-8 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow border-gray-200 hover:border-gray-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Test Connection</h3>
              <p className="text-gray-600 text-sm">Verify setup</p>
            </div>
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            McCarren Tournament Management System
          </p>
        </div>
      </div>
    </div>
  );
}