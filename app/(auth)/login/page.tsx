"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Grab all form values at once without 10 different useStates
    const formData = new FormData(e.currentTarget);
    const credentials = Object.fromEntries(formData);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Invalid credentials");
        }

        // Secure Redirect: Ensure it's an internal path
        const from = searchParams.get("from") || "/dashboard";
        const safeRedirect = from.startsWith("/") ? from : "/dashboard";

        router.push(safeRedirect);
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Branding */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <div className="">
          <Image src={"logo.svg"} alt="" width={200} height={200} />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-10 shadow-2xl shadow-neutral-200/50">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-neutral-900">
            Welcome back
          </h1>
          <p className="text-neutral-500 text-sm">
            Please enter your details to sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="name@company.com"
              className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-brand-orange hover:underline"
              >
                Forgot?
              </button>
            </div>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="relative w-full py-4 bg-neutral-900 text-white font-bold rounded-2xl text-sm transition-all hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-70"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in to Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
