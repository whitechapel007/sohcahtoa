import { getBalance } from '@/lib/dashboard/getBalance';
import { getCards } from '@/lib/dashboard/getCards';
import { getTransactions } from '@/lib/dashboard/getTransactions';
import BalanceWidget from '@/components/dashboard/BalanceWidget';
import FXActions from '@/components/dashboard/FXActions';
import FXTransactionList from '@/components/dashboard/FXTransactionList';
import CardWidget from '@/components/dashboard/CardWidget';
import CardTransactionList from '@/components/dashboard/CardTransactionList';
import CardFlows from '@/components/dashboard/CardFlows';

export default async function DashboardPage() {
  const [fxTransactions, cardTransactions, cards] = await Promise.all([
    getTransactions({ limit: 5 }),
    getTransactions({ limit: 5 }),
    getCards(),
  ]);
  const balance = getBalance();

  return (
    <div className="p-5 flex gap-5 min-h-full">
      {/* ── Left / FX panel ── */}
      <div className="flex-1 min-w-0 bg-panel rounded-2xl p-6 flex flex-col gap-6 self-start">
        <BalanceWidget balance={balance} />
        <FXActions />
        <div className="border-t border-neutral-100" />
        <FXTransactionList transactions={fxTransactions} />
      </div>

      {/* ── Right / Cards panel ── */}
      <div className="w-[310px] shrink-0 bg-panel rounded-2xl p-6 flex flex-col gap-6 self-start">
        <CardWidget cards={cards} />
        <div className="border-t border-neutral-100" />
        <CardTransactionList transactions={cardTransactions} />
        <div className="border-t border-neutral-100" />
        <CardFlows balance={balance} />
      </div>
    </div>
  );
}
