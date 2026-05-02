import type { VirtualCard } from '@/types';
import { ChipIcon, VisaLogoIcon, PlusIcon } from '@/components/core/Icons';

interface CardWidgetProps {
  cards: VirtualCard[];
}

function VirtualCardDisplay({ card }: { card: VirtualCard }) {
  const balanceParts = card.balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      className="relative rounded-2xl overflow-hidden text-white select-none"
      style={{
        background: 'linear-gradient(135deg, #7C2800 0%, #C44010 35%, #E07030 70%, #F09050 100%)',
        aspectRatio: '1.586 / 1',
        minWidth: 0,
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />
      <div
        className="absolute top-6 -right-12 w-32 h-32 rounded-full"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      />
      <div
        className="absolute -bottom-10 -left-8 w-44 h-44 rounded-full"
        style={{ background: 'rgba(0,0,0,0.12)' }}
      />

      <div className="relative z-10 p-5 flex flex-col justify-between h-full">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/70 mb-0.5">
              Prepaid card
            </p>
          </div>
          <VisaLogoIcon className="opacity-90" />
        </div>

        {/* Chip */}
        <div className="mt-2">
          <ChipIcon size={36} />
        </div>

        {/* Bottom info */}
        <div className="mt-auto">
          <p className="text-sm font-mono tracking-[0.2em] text-white/90 mb-2">
            ••••&nbsp;&nbsp;{card.lastFour}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold leading-tight">
                ${balanceParts}
                <span className="text-xs font-normal text-white/70 ml-0.5">00</span>
              </p>
              <p className="text-[10px] text-white/60 mt-0.5">
                VALID THRU {card.validThru}
              </p>
            </div>
            <p className="text-xs font-medium text-white/80">{card.holder}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCardPlaceholder() {
  return (
    <div
      className="
        rounded-2xl border-2 border-dashed border-neutral-300
        flex items-center justify-center cursor-pointer
        hover:border-brand-orange hover:bg-brand-orange-light
        transition-all group
      "
      style={{ aspectRatio: '1.586 / 1', minWidth: 0, minHeight: 80 }}
    >
      <div className="flex flex-col items-center gap-2 text-neutral-400 group-hover:text-brand-orange transition-colors">
        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
          <PlusIcon size={14} />
        </div>
      </div>
    </div>
  );
}

export default function CardWidget({ cards }: CardWidgetProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-800 mb-4">Cards</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <VirtualCardDisplay key={card.id} card={card} />
        ))}
        <AddCardPlaceholder />
      </div>
    </div>
  );
}
