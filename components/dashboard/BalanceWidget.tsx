"use client";

import { useState } from "react";
import type { BalanceSummary } from "@/types";
import { EyeIcon, ChevronDownIcon } from "@/components/core/Icons";

interface BalanceWidgetProps {
  balance: BalanceSummary;
}

const FILTER_TABS = ["FX bought", "FX sold", "Others"] as const;

export default function BalanceWidget({ balance }: BalanceWidgetProps) {
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTER_TABS)[number]>("Others");
  const [hidden, setHidden] = useState(false);

  const formatted = balance.total.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [dollars, cents] = formatted.split(".");

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Row ── */}
      <div className="flex items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`
                  px-2.5 py-0.75 rounded-full text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-[#FFF6F1] text-brand-orange border border-orange-200"
                      : "bg-transparent text-neutral-500 border border-neutral-200 hover:border-neutral-300"
                  }
                `}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right pill (Medicals) */}
        <button className="flex items-center gap-2 px-2 py-2 bg-neutral-900 text-white rounded-full text-xs font-medium">
          <span>Medicals</span>
          <ChevronDownIcon size={14} className="text-neutral-300" />
        </button>
      </div>

      {/* ── Balance Block ── */}
      <div className="flex flex-col gap-2">
        {/* Label */}
        <div className="flex items-center gap-2 text-main-text text-sm">
          <span>Total FX units</span>
          <button
            onClick={() => setHidden((h) => !h)}
            className="text-neutral-600 hover:text-neutral-800 transition"
          >
            <EyeIcon size={16} variant="Outline" color="black" />
          </button>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-3">
          {/* $ badge */}
          <div className="w-9 h-9 rounded-xl bg-[#ECECEC] flex items-center justify-center text-neutral-700 font-semibold">
            $
          </div>

          {hidden ? (
            <span className="font-space-grotesk text-[32px] leading-none tracking-tight text-neutral-900 bg-[#232323] px-4 py-2 rounded">
              ••••••••
            </span>
          ) : (
            <div className="flex items-end">
              <span className="font-space-grotesk text-[32px] leading-none tracking-tight text-main-text py-2 rounded">
                {dollars}
              </span>
              <span className="text-[24px] font-semibold text-neutral-400 mb-1">
                .{cents}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
