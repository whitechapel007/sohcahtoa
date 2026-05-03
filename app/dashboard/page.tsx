import { getBalance } from "@/lib/dashboard/getBalance";
import { getCards } from "@/lib/dashboard/getCards";
import { getTransactions } from "@/lib/dashboard/getTransactions";
import BalanceWidget from "@/components/dashboard/BalanceWidget";
import FXActions from "@/components/dashboard/FXActions";
import FXTransactionList from "@/components/dashboard/FXTransactionList";
import CardWidget from "@/components/dashboard/CardWidget";
import CardTransactionList from "@/components/dashboard/CardTransactionList";
import CardFlows from "@/components/dashboard/CardFlows";

export default async function DashboardPage() {
  const [fxTransactions, cardTransactions, cards] = await Promise.all([
    getTransactions({ limit: 5 }),
    getTransactions({ limit: 5 }),
    getCards(),
  ]);

  const balance = getBalance();

  return (
    <div className="flex gap-6 w-full p-8">
      {/* ───────────────── LEFT COLUMN ───────────────── */}
      <div className="flex-1 flex flex-col gap-6">
        {/* ── Balance + Actions (single card) ── */}
        <div className="bg-panel rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <BalanceWidget balance={balance} />
          <FXActions />
        </div>

        {/* ── FX Transactions Card ── */}
        <div className="bg-panel rounded-2xl p-6 shadow-sm">
          <FXTransactionList transactions={fxTransactions} />
        </div>
      </div>

      {/* ───────────────── RIGHT COLUMN ───────────────── */}
      <div className="w-[450px] shrink-0">
        <div className="bg-panel rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          {/* Cards */}
          <CardWidget cards={cards} />

          <div className="border-t border-neutral-100" />

          {/* Card Transactions */}
          <CardTransactionList transactions={cardTransactions} />

          <div className="border-t border-neutral-100" />

          {/* Flows */}
          <CardFlows balance={balance} />
        </div>
      </div>
    </div>
  );
}
