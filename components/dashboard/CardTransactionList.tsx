import Link from 'next/link';
import type { Transaction } from '@/types';
import TransactionListItem from './TransactionListItem';

interface CardTransactionListProps {
  transactions: Transaction[];
}

export default function CardTransactionList({ transactions }: CardTransactionListProps) {
  const displayed = transactions.slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-800">Card transactions</h2>
        <Link
          href="/dashboard/cards"
          className="text-xs font-medium text-neutral-500 border border-neutral-200 px-3 py-1.5 rounded-full hover:text-brand-orange hover:border-brand-orange transition-all"
        >
          See all
        </Link>
      </div>

      <div className="divide-y divide-neutral-100">
        {displayed.map((tx) => (
          <TransactionListItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </div>
  );
}
