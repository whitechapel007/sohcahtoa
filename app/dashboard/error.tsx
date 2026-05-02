"use client";

import { useEffect } from "react";

import { ShieldX } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Dashboard error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 p-6">
      <div className="w-14 h-14 rounded-2xl bg-negative-bg flex items-center justify-center text-2xl">
        <ShieldX />
      </div>
      <h2 className="text-lg font-semibold text-neutral-800">
        Something went wrong
      </h2>
      <p className="text-sm text-neutral-500 text-center max-w-sm">
        {error.message ||
          "An unexpected error occurred while loading the dashboard."}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-medium rounded-xl text-sm transition-all"
      >
        Try again
      </button>
    </div>
  );
}
