'use client';

import { useState } from 'react';
import { supabase } from '../../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      const userRole = data.user?.user_metadata?.user_role || 'player';
      setMessage('Login successful!');

      setTimeout(() => {
        if (userRole === 'admin' || userRole === 'organizer') {
          router.push('/admin');
        } else if (userRole === 'developer') {
          router.push('/developer');
        } else {
          router.push('/dashboard');
        }
      }, 500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8">
        <div>
          {/* Logo placeholder if needed */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎾</span>
            </div>
          </div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Welcome back to Mccarren Tournament
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-lg border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 shadow-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-lg border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 shadow-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 shadow-sm transition-all duration-200"
              disabled={loading}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-emerald-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-emerald-300 group-hover:text-emerald-200" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                )}
              </span>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {message && (
            <div className={`text-center text-sm p-2 rounded-md ${message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="text-sm text-center">
            <Link href="/auth/signup" className="font-semibold text-emerald-600 hover:text-emerald-500">
              Don't have an account? Sign up
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-50 px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
                if (error) setMessage(`Error: ${error.message}`);
                setLoading(false);
              }}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
            >
              <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  d="M12.0003 20.45c4.648 0 8.026-3.238 8.026-8.219 0-.769-.074-1.398-.204-2.126h-7.822v4.032h4.524c-.209 1.488-1.54 4.098-4.524 4.098-2.735 0-4.966-2.227-4.966-4.985s2.231-4.985 4.966-4.985c1.282 0 2.404.453 3.303 1.309l3.125-3.125C13.5683 1.059 10.749 0 7.979 0 3.568 0 0 3.568 0 7.979c0 4.411 3.568 7.979 7.979 7.979 2.055 0 3.996-.828 5.438-2.204"
                  fill="#4285F4"
                />
                <path
                  d="M4.021 17.51L6.702 14.83c-.456-1.077-.723-2.179-.723-3.6 0-1.42.267-2.523.723-3.6L4.021 4.041C1.65 8.169 1.65 13.91 4.021 17.51"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0003 4.88c2.193 0 4.148.784 5.645 2.072l3.197-3.196C18.667 1.942 15.602.84 12.0003.84c-4.411 0-7.979 3.568-7.979 7.979 0 .285.021.564.053.84l2.645-2.646C7.027 5.69 9.38 4.88 12.0003 4.88"
                  fill="#EA4335"
                />
                <path
                  d="M20.245 12.449c0-.769-.074-1.398-.204-2.126h-7.822v4.032h4.524c-.114.82-.477 1.545-.989 2.155l3.228 3.229c1.865-1.747 2.973-4.322 2.973-7.29"
                  fill="#34A853"
                />
              </svg>
              <span className="text-sm font-semibold">Sign in with Google</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}