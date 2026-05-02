import type { Transaction } from '@/types';
import {
  OutgoingArrowIcon,
  IncomingCheckIcon,
  WalletSwapIcon,
} from '@/components/core/Icons';

interface TransactionListItemProps {
  readonly transaction: Transaction;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const datePart = d.toLocaleDateString('en-US', opts);
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart} • ${timePart}`;
}

function formatAmount(amount: number, currency: string): string {
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = amount >= 0 ? '+' : '-';
  return `${prefix}$${abs}`;
}

export default function TransactionListItem({ transaction }: TransactionListItemProps) {
  const isTransfer = transaction.category === 'Transfer';
  const isOutgoing = !isTransfer && transaction.amount < 0;
  const isIncoming = !isTransfer && transaction.amount >= 0;

  return (
    <div className="flex items-center gap-3 py-3">
      {/* Icon circle */}
      <div
        className={`
          w-9 h-9 rounded-full flex items-center justify-center shrink-0
          ${isOutgoing ? 'bg-brand-orange-light' : ''}
          ${isIncoming ? 'bg-positive-bg' : ''}
          ${isTransfer ? 'bg-neutral-100' : ''}
        `}
      >
        {isOutgoing && <OutgoingArrowIcon size={15} className="text-brand-orange" />}
        {isIncoming && <IncomingCheckIcon size={13} className="text-positive" />}
        {isTransfer && <WalletSwapIcon size={15} className="text-neutral-500" />}
      </div>

      {/* Description + date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 truncate">
          {transaction.description}
        </p>
        <p className="text-xs text-neutral-400 mt-0.5 truncate">
          {formatDate(transaction.date)}
        </p>
      </div>

      {/* Amount */}
      <span
        className={`
          text-sm font-semibold shrink-0
          ${transaction.amount >= 0 ? 'text-positive' : 'text-negative'}
        `}
      >
        {formatAmount(transaction.amount, transaction.currency)}
      </span>
    </div>
  );
}
