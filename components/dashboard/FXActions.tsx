"use client";

import { useState } from "react";
import {
  BuyFXIcon,
  ReceiveMoneyIcon,
  SellFXIcon,
} from "@/components/core/Icons";
import ActionModal from "./ActionModal";

const ACTIONS = [
  {
    key: "buy" as const,
    label: "Buy FX",
    icon: BuyFXIcon,
  },
  {
    key: "sell" as const,
    label: "Sell FX",
    icon: SellFXIcon,
  },
  {
    key: "receive" as const,
    label: "Receive money",
    icon: ReceiveMoneyIcon,
  },
];

export default function FXActions() {
  const [modalType, setModalType] = useState<"buy" | "sell" | "receive" | null>(
    null,
  );

  return (
    <>
      <div className="flex items-center gap-3">
        {ACTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setModalType(key)}
            className="
      w-[80px] h-[80px]
      flex flex-col items-center justify-center gap-3
      rounded-2xl border border-neutral-200
      hover:border-neutral-300 hover:bg-neutral-50
      active:scale-[0.97]
      transition-all
    "
          >
            <Icon size={20} variant="Outline" color={"black"} />

            <span className="text-xs font-medium text-neutral-700 text-center leading-tight">
              {label}
            </span>
          </button>
        ))}
      </div>

      <ActionModal type={modalType} onClose={() => setModalType(null)} />
    </>
  );
}
