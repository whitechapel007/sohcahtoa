"use client";

import React, { useState, useEffect, useOptimistic, useTransition } from "react";
import {
  X,
  Flag,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  User,
  CreditCard,
  Tag,
  Hash,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  StickyNote,
  ShieldAlert,
} from "lucide-react";
import type { Transaction, UserRole } from "@/types";
import { apiFetchJSON, ApiClientError } from "@/lib/api-client";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  transaction: Transaction;
  userRole: UserRole;
  onClose: () => void;
  onTransactionUpdated: (tx: Transaction) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; className: string }
> = {
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    className: "text-positive bg-positive/10",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    className: "text-amber-600 bg-amber-50",
  },
  flagged: {
    icon: AlertTriangle,
    label: "Flagged",
    className: "text-negative bg-negative/10",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "text-neutral-500 bg-neutral-100",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  FX: "Foreign Exchange",
  PTA: "Personal Travel Allowance",
  BTA: "Business Travel Allowance",
  Medicals: "Medical Payment",
  Transfer: "Bank Transfer",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmount(amount: number, currency: string) {
  const abs = Math.abs(amount);
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(abs)}`;
}

function fmtDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function maskAccount(acct: string) {
  return `•••• •••• •••• ${acct.slice(-4)}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TransactionDetailPanel({
  transaction,
  userRole,
  onClose,
  onTransactionUpdated,
}: Props) {
  const [noteText, setNoteText] = useState(transaction.note ?? "");
  const [flagError, setFlagError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteSaved, setNoteSaved] = useState(false);

  const [isFlagPending, startFlagTransition] = useTransition();
  const [isNotePending, startNoteTransition] = useTransition();

  const [optimisticTx, addOptimistic] = useOptimistic(
    transaction,
    (_state: Transaction, update: Transaction) => update,
  );

  useEffect(() => {
    setNoteText(transaction.note ?? "");
    setFlagError(null);
    setNoteError(null);
    setNoteSaved(false);
  }, [transaction.id, transaction.note]);

  async function handleFlag() {
    if (optimisticTx.status === "flagged") return;
    setFlagError(null);
    startFlagTransition(async () => {
      addOptimistic({ ...optimisticTx, status: "flagged" });
      try {
        const res = await apiFetchJSON<{ ok: boolean; transaction: Transaction }>(
          `/api/dashboard/transactions/${optimisticTx.id}/flag`,
          { method: "POST" },
        );
        onTransactionUpdated(res.transaction);
      } catch (err) {
        setFlagError(
          err instanceof ApiClientError ? err.message : "Failed to flag transaction.",
        );
      }
    });
  }

  async function handleSaveNote() {
    setNoteError(null);
    setNoteSaved(false);
    startNoteTransition(async () => {
      try {
        const res = await apiFetchJSON<{ ok: boolean; transaction: Transaction }>(
          `/api/dashboard/transactions/${optimisticTx.id}/note`,
          { method: "POST", data: { note: noteText } },
        );
        onTransactionUpdated(res.transaction);
        setNoteSaved(true);
      } catch (err) {
        setNoteError(
          err instanceof ApiClientError ? err.message : "Failed to save note.",
        );
      }
    });
  }

  const isCredit = optimisticTx.amount >= 0;
  const status = STATUS_CONFIG[optimisticTx.status] ?? STATUS_CONFIG.failed;
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col h-full bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.04)]">
      {/* ── Glass Header ── */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
            Transaction Details
          </h2>
          <p className="text-[10px] text-neutral-400 font-mono mt-0.5 uppercase tracking-tighter">
            Ref: {optimisticTx.id.slice(0, 12)}...
          </p>
        </div>
        <button
          onClick={onClose}
          className="group w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all active:scale-90"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* ── Hero Section ── */}
        <div className="px-6 py-8 text-center border-b border-neutral-50 bg-gradient-to-b from-neutral-50/50 to-white">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-sm ${
              isCredit
                ? "bg-positive/10 text-positive"
                : "bg-neutral-900 text-white"
            }`}
          >
            {isCredit ? (
              <ArrowDownLeft size={28} />
            ) : (
              <ArrowUpRight size={28} />
            )}
          </div>

          <h1
            className={`text-4xl font-bold tracking-tight mb-2 ${
              isCredit ? "text-positive" : "text-neutral-900"
            }`}
          >
            {fmtAmount(optimisticTx.amount, optimisticTx.currency)}
          </h1>

          <p className="text-neutral-500 font-medium max-w-[240px] mx-auto leading-relaxed text-sm">
            {optimisticTx.description}
          </p>

          <div className="flex items-center justify-center gap-2 mt-6">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${status.className} border border-current/10`}
            >
              <StatusIcon size={12} />
              {status.label}
            </span>
          </div>
        </div>

        {/* ── Information Grid ── */}
        <div className="px-6 py-8 space-y-8">
          {/* Metadata Group */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.15em]">
              Core Information
            </h3>
            <div className="grid grid-cols-1 gap-y-1 bg-neutral-50/50 rounded-2xl p-4 border border-neutral-100">
              <DetailRow
                icon={Calendar}
                label="Timestamp"
                value={fmtDate(optimisticTx.date)}
              />
              <DetailRow
                icon={User}
                label="Counterparty"
                value={isCredit ? optimisticTx.sender : optimisticTx.recipient}
              />
              <DetailRow
                icon={CreditCard}
                label="Account Used"
                value={maskAccount(optimisticTx.accountNumber)}
                mono
              />
              <DetailRow
                icon={Tag}
                label="Classification"
                value={
                  CATEGORY_LABELS[optimisticTx.category] ??
                  optimisticTx.category
                }
              />
            </div>
          </section>

          {/* Note Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.15em]">
                Internal Memo
              </h3>
              {noteSaved && (
                <span className="text-[10px] font-bold text-positive flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                  <CheckCircle2 size={10} /> Synced
                </span>
              )}
            </div>

            <div className="relative group">
              <textarea
                value={noteText}
                onChange={(e) => {
                  setNoteText(e.target.value);
                  setNoteSaved(false);
                }}
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-2xl shadow-sm transition-all focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange outline-none resize-none placeholder:text-neutral-300"
                placeholder="Leave a note for the audit trail..."
              />
              <button
                onClick={handleSaveNote}
                disabled={
                  isNotePending || noteText === (transaction.note ?? "") || noteText.trim() === ""
                }
                className={`absolute bottom-3 right-3 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  isNotePending || noteText === (transaction.note ?? "") || noteText.trim() === ""
                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    : "bg-neutral-900 text-white hover:bg-neutral-700 cursor-pointer"
                }`}
              >
                {isNotePending ? "Saving..." : "Update Note"}
              </button>
            </div>
          </section>

          {/* Audit/Flag Info if applicable */}
          {optimisticTx.status === "flagged" && (
            <section className="p-4 bg-negative/5 border border-negative/10 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-negative">
                <ShieldAlert size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Compliance Flag
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">Initiated by</span>
                <span className="font-semibold text-neutral-900">
                  {optimisticTx.flaggedBy}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">Flagged at</span>
                <span className="font-medium text-neutral-700">
                  {fmtDate(optimisticTx.flaggedAt!)}
                </span>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── Action Footer ── */}
      {userRole === "admin" && (
        <div className="p-6 bg-white border-t border-neutral-100">
          <button
            onClick={handleFlag}
            disabled={isFlagPending || optimisticTx.status === "flagged"}
            className={`
              w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]
              ${
                optimisticTx.status === "flagged"
                  ? "bg-negative/10 text-negative border border-negative/20 cursor-default"
                  : "bg-white border-2 border-negative/20 text-negative hover:bg-negative hover:text-white hover:border-negative shadow-sm shadow-negative/5"
              }
            `}
          >
            <Flag size={16} className={isFlagPending ? "animate-bounce" : ""} />
            {optimisticTx.status === "flagged"
              ? "Marked as Fraudulent"
              : "Flag for Review"}
          </button>
          {flagError && (
            <p className="mt-3 text-[11px] text-center text-negative font-medium">
              {flagError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Refined DetailRow component for high density
function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white rounded-lg border border-neutral-100 shadow-sm">
          <Icon size={12} className="text-neutral-400" />
        </div>
        <span className="text-xs font-medium text-neutral-400">{label}</span>
      </div>
      <span
        className={`text-xs font-semibold text-neutral-900 ${mono ? "font-mono tracking-tighter bg-neutral-100 px-1.5 py-0.5 rounded" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
