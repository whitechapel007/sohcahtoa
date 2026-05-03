"use client";

import { useState } from "react";
import Link from "next/link";
import type { Transaction, TransactionCategory } from "@/types";
import TransactionListItem from "./TransactionListItem";

interface FXTransactionListProps {
  readonly transactions: Transaction[];
}

const TABS: (TransactionCategory | "All")[] = [
  "All",
  "FX",
  "PTA",
  "BTA",
  "Medicals",
];

export default function FXTransactionList({
  transactions,
}: FXTransactionListProps) {
  const [activeTab, setActiveTab] = useState<TransactionCategory | "All">(
    "All",
  );

  const filtered =
    activeTab === "All"
      ? transactions
      : transactions.filter((t) => t.category === activeTab);

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-neutral-900">
          FX transactions
        </h2>

        <Link
          href="/dashboard/transactions"
          className="text-xs font-medium text-neutral-600 border border-neutral-200 px-3 py-1 rounded-full hover:text-neutral-900 hover:border-neutral-300 transition"
        >
          See all
        </Link>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 mb-5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium transition-all
                ${
                  isActive
                    ? "bg-orange-50 text-brand-orange border border-orange-200"
                    : "text-neutral-500 border border-transparent hover:text-neutral-700"
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      <div className="flex flex-col">
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-400 py-8 text-center">
            No transactions found.
          </p>
        ) : (
          filtered.map((tx, index) => (
            <div
              key={tx.id}
              className={`
                ${index !== 0 ? "border-t border-neutral-100" : ""}
                py-3
              `}
            >
              <TransactionListItem transaction={tx} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
