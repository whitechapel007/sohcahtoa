import type { VirtualCard } from "@/types";
import { PlusIcon } from "@/components/core/Icons";

interface CardWidgetProps {
  cards: VirtualCard[];
}

function ChipSVG() {
  return (
    <svg
      width="38"
      height="30"
      viewBox="0 0 38 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="chip_grad"
          x1="0"
          y1="0"
          x2="38"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F5C842" />
          <stop offset="45%" stopColor="#D4A030" />
          <stop offset="100%" stopColor="#A07820" />
        </linearGradient>
      </defs>
      <rect width="38" height="30" rx="4" fill="url(#chip_grad)" />
      {/* contact lines */}
      <line
        x1="0"
        y1="10"
        x2="38"
        y2="10"
        stroke="#A07820"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <line
        x1="0"
        y1="20"
        x2="38"
        y2="20"
        stroke="#A07820"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <line
        x1="13"
        y1="0"
        x2="13"
        y2="30"
        stroke="#A07820"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <line
        x1="25"
        y1="0"
        x2="25"
        y2="30"
        stroke="#A07820"
        strokeWidth="0.8"
        opacity="0.7"
      />
      {/* center contact plate */}
      <rect x="13" y="10" width="12" height="10" rx="1" fill="#B88828" />
    </svg>
  );
}

export function VirtualCardDisplay({
  card,
  selected,
}: {
  card: VirtualCard;
  selected?: boolean;
}) {
  const formatted = card.balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [balanceWhole, balanceCents] = formatted.split(".");

  return (
    <div
      className={`relative rounded-2xl overflow-hidden text-white select-none transition-shadow ${selected ? "ring-2 ring-offset-2 ring-brand-orange" : ""}`}
      style={{
        background:
          "linear-gradient(135deg, #7C2800 0%, #C44010 35%, #E07030 70%, #F09050 100%)",
        aspectRatio: "1.586 / 1",
        minWidth: 0,
      }}
    >
      {/* Decorative shapes */}
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      <div
        className="absolute top-6 -right-12 w-32 h-32 rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
      <div
        className="absolute -bottom-10 -left-8 w-44 h-44 rounded-full"
        style={{ background: "rgba(0,0,0,0.12)" }}
      />

      <div className="relative z-10 p-5 flex flex-col justify-between h-full">
        {/* Top row: chip + label | VISA */}
        <div className="flex items-center justify-between">
          <div className="flex  gap-2.5">
            <ChipSVG />
            <p className="text-[11px] font-medium text-white/80 tracking-wide">
              Prepaid card
            </p>
          </div>
          <span
            className="text-xl font-black text-white tracking-wider"
            style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
          >
            VISA
          </span>
        </div>

        {/* Bottom row: card number + valid thru | balance + holder */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-mono tracking-[0.2em] text-white/90 mb-1">
              ••••&nbsp;&nbsp;{card.lastFour}
            </p>
            <p className="text-[9px] font-medium text-white/60 tracking-widest uppercase leading-none">
              Valid
            </p>
            <p className="text-[9px] font-medium text-white/60 tracking-widest uppercase leading-none">
              Thru&nbsp;{card.validThru}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold leading-tight">
              ${balanceWhole}
              <span className="text-xs font-normal text-white/70">
                .{balanceCents}
              </span>
            </p>
            <p className="text-[10px] text-white/70 mt-0.5">{card.holder}</p>
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
        h-full rounded-2xl border-2 border-dashed border-main-text
        flex items-center justify-center cursor-pointer
        hover:border-brand-orange hover:bg-brand-orange-light
        transition-all group
      "
    >
      <div className="text-neutral-400 group-hover:text-brand-orange transition-colors">
        <PlusIcon size={20} />
      </div>
    </div>
  );
}

export default function CardWidget({ cards }: CardWidgetProps) {
  const primary = cards[0];
  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-800 mb-4">Cards</h2>
      <div className="flex gap-3 items-stretch">
        <div className="flex-1 min-w-0">
          {primary && <VirtualCardDisplay card={primary} />}
        </div>
        <div className="w-20 shrink-0">
          <AddCardPlaceholder />
        </div>
      </div>
    </div>
  );
}
