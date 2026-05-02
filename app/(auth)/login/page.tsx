'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const params = new URLSearchParams(window.location.search);
          router.push(params.get('from') ?? '/dashboard');
          router.refresh();
        } else {
          const data = await res.json();
          setError(data.error ?? 'Login failed. Please try again.');
        }
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 justify-center">
        <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="6" width="3" height="10" rx="1.5" fill="white" />
            <rect x="7" y="3" width="3" height="16" rx="1.5" fill="white" />
            <rect x="12" y="6" width="3" height="10" rx="1.5" fill="white" />
            <rect x="17" y="8" width="3" height="6" rx="1.5" fill="white" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-neutral-900 text-lg leading-tight">SohCahToa</p>
          <p className="text-neutral-500 text-xs">Payout BDC</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-panel rounded-2xl shadow-sm border border-neutral-100 p-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Welcome back</h1>
        <p className="text-neutral-500 text-sm mb-6">Sign in to your dashboard</p>

        {/* Demo hint */}
        <div className="mb-5 px-4 py-3 bg-brand-orange-light rounded-xl text-xs text-brand-orange border border-brand-orange-muted space-y-0.5">
          <p><strong>Admin:</strong> admin@sohcahtoa.com / admin123</p>
          <p><strong>Analyst:</strong> analyst@sohcahtoa.com / analyst123</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-negative bg-negative-bg px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full py-3 px-4 bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.98] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-neutral-400 mt-6">
        © {new Date().getFullYear()} SohCahToa Payout BDC. All rights reserved.
      </p>
    </div>
  );
}
