import type { BalanceSummary } from '@/types';

interface CardFlowsProps {
  balance: BalanceSummary;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CardFlows({ balance }: CardFlowsProps) {
  const total = balance.moneyIn + balance.moneyOut;
  const inPercent = total > 0 ? (balance.moneyIn / total) * 100 : 0;
  const outPercent = total > 0 ? (balance.moneyOut / total) * 100 : 0;

  const netAmount = balance.moneyIn - balance.moneyOut;
  const netFormatted = `${netAmount >= 0 ? '+' : '-'}$${formatAmount(Math.abs(netAmount))}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">Card transaction flows</h2>
        <span
          className={`text-sm font-bold ${netAmount >= 0 ? 'text-positive' : 'text-negative'}`}
        >
          {netFormatted}
          <span className="text-[10px] font-normal text-neutral-400 ml-0.5">00</span>
        </span>
      </div>

      {/* Money In */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-neutral-500">Money in</span>
          <span className="font-medium text-neutral-700">${formatAmount(balance.moneyIn)}</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-positive rounded-full transition-all duration-500"
            style={{ width: `${inPercent}%` }}
          />
        </div>
      </div>

      {/* Money Out */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-neutral-500">Money out</span>
          <span className="font-medium text-neutral-700">${formatAmount(balance.moneyOut)}</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-orange rounded-full transition-all duration-500"
            style={{ width: `${outPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
