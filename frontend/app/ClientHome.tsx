'use client';

import Link from 'next/link';

export default function ClientHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="font-bold text-xl text-slate-800">Mccarren Tournament</div>
        <Link
          href="/auth/login"
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Professional Tennis Tournament Management
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            The complete solution for organizing brackets, scheduling matches, and managing players efficiently.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-sm"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} Mccarren Tournament. All rights reserved.
      </footer>
    </div>
  );
}