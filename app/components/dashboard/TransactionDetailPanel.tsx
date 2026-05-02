'use client';

import { useState, useEffect, useOptimistic, useTransition } from 'react';
import { X, Flag, StickyNote } from 'lucide-react';
import type { Transaction, UserRole } from '@/types';
import { apiFetchJSON, ApiClientError } from '@/lib/api-client';

interface Props {
  readonly transaction: Transaction;
  readonly userRole: UserRole;
  readonly onClose: () => void;
  readonly onTransactionUpdated: (tx: Transaction) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  completed: 'bg-positive-bg text-positive',
  flagged:   'bg-negative-bg text-negative',
  failed:    'bg-neutral-100 text-neutral-500',
};

function fmtAmount(amount: number, currency: string) {
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount >= 0 ? '+' : '-'}${currency} ${abs}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export default function TransactionDetailPanel({
  transaction,
  userRole,
  onClose,
  onTransactionUpdated,
}: Props) {
  const [noteText, setNoteText] = useState(transaction.note ?? '');
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
    setNoteText(transaction.note ?? '');
    setFlagError(null);
    setNoteError(null);
    setNoteSaved(false);
  }, [transaction.id, transaction.note]);

  function handleFlag() {
    if (optimisticTx.status === 'flagged') return;
    setFlagError(null);
    startFlagTransition(async () => {
      addOptimistic({ ...transaction, status: 'flagged', flaggedBy: 'You', flaggedAt: new Date().toISOString() });
      try {
        const res = await apiFetchJSON<{ ok: boolean; transaction: Transaction }>(
          `/api/dashboard/transactions/${transaction.id}/flag`,
          { method: 'POST' },
        );
        onTransactionUpdated(res.transaction);
      } catch (err) {
        setFlagError(err instanceof ApiClientError ? err.message : 'Failed to flag transaction.');
      }
    });
  }

  function handleSaveNote(e: React.SyntheticEvent) {
    e.preventDefault();
    setNoteError(null);
    setNoteSaved(false);
    startNoteTransition(async () => {
      addOptimistic({ ...transaction, note: noteText });
      try {
        const res = await apiFetchJSON<{ ok: boolean; transaction: Transaction }>(
          `/api/dashboard/transactions/${transaction.id}/note`,
          { method: 'POST', data: { note: noteText } },
        );
        onTransactionUpdated(res.transaction);
        setNoteSaved(true);
      } catch (err) {
        setNoteError(err instanceof ApiClientError ? err.message : 'Failed to save note.');
      }
    });
  }

  const flaggedAt = optimisticTx.flaggedAt ? fmtDate(optimisticTx.flaggedAt) : '';

  const detailRows = [
    { label: 'Date',      value: fmtDate(optimisticTx.date) },
    { label: 'Sender',    value: optimisticTx.sender },
    { label: 'Recipient', value: optimisticTx.recipient },
    { label: 'Account',   value: optimisticTx.accountNumber },
    ...(optimisticTx.flaggedBy
      ? [
          { label: 'Flagged by', value: optimisticTx.flaggedBy },
          { label: 'Flagged at', value: flaggedAt },
        ]
      : []),
  ];

  let flagLabel = 'Flag transaction';
  if (optimisticTx.status === 'flagged') flagLabel = 'Flagged';
  else if (isFlagPending) flagLabel = 'Flagging…';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
        <h2 className="text-sm font-semibold text-neutral-900">Transaction details</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div className="text-center py-2">
          <p className={`text-3xl font-bold ${optimisticTx.amount >= 0 ? 'text-positive' : 'text-negative'}`}>
            {fmtAmount(optimisticTx.amount, optimisticTx.currency)}
          </p>
          <p className="text-sm text-neutral-500 mt-1">{optimisticTx.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[optimisticTx.status] ?? STATUS_STYLES.failed}`}>
            {optimisticTx.status}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
            {optimisticTx.category}
          </span>
        </div>

        <dl className="space-y-3">
          {detailRows.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 text-sm">
              <dt className="text-neutral-500 shrink-0">{label}</dt>
              <dd className="text-neutral-800 font-medium text-right break-all">{value}</dd>
            </div>
          ))}
        </dl>

        <hr className="border-neutral-100" />

        <form onSubmit={handleSaveNote} className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
            <StickyNote size={14} />
            Note
          </label>
          <textarea
            value={noteText}
            onChange={(e) => { setNoteText(e.target.value); setNoteSaved(false); }}
            maxLength={500}
            rows={3}
            placeholder="Add a private note…"
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange text-neutral-800 placeholder:text-neutral-400"
          />
          {noteError && <p className="text-xs text-negative">{noteError}</p>}
          {noteSaved && !noteError && <p className="text-xs text-positive">Note saved.</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">{noteText.length}/500</span>
            <button
              type="submit"
              disabled={isNotePending || noteText.trim() === ''}
              className="px-3 py-1.5 text-xs font-medium bg-brand-orange text-white rounded-lg hover:bg-brand-orange-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isNotePending ? 'Saving…' : 'Save note'}
            </button>
          </div>
        </form>

        {userRole === 'admin' && (
          <div className="space-y-2">
            <hr className="border-neutral-100" />
            {flagError && <p className="text-xs text-negative">{flagError}</p>}
            <button
              onClick={handleFlag}
              disabled={isFlagPending || optimisticTx.status === 'flagged'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-negative text-negative rounded-lg hover:bg-negative-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Flag size={14} />
              {flagLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
