"use client";

import { useState } from "react";
import Modal from "@/components/core/Modal";

interface ActionModalProps {
  type: "buy" | "sell" | "receive" | null;
  onClose: () => void;
}

export default function ActionModal({ type, onClose }: ActionModalProps) {
  const [amount, setAmount] = useState("");

  if (!type) return null;

  const config = {
    buy: {
      title: "Buy FX",
      description: "Purchase foreign currency at the current exchange rate.",
      cta: "Continue",
    },
    sell: {
      title: "Sell FX",
      description: "Convert your foreign currency back to your base currency.",
      cta: "Continue",
    },
    receive: {
      title: "Receive Money",
      description: "Generate account details to receive funds.",
      cta: "Generate details",
    },
  }[type];

  return (
    <Modal open={!!type} onClose={onClose} title={config.title}>
      <div className="flex flex-col gap-6">
        {/* Description */}
        <p className="text-sm text-neutral-500 leading-relaxed">
          {config.description}
        </p>

        {/* Amount */}
        {type !== "receive" && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-700">
              Amount (USD)
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                $
              </span>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="
                  w-full pl-9 pr-4 py-3.5
                  rounded-xl border border-neutral-200
                  text-sm text-neutral-800
                  outline-none
                  focus:border-brand-orange
                  focus:ring-4 focus:ring-brand-orange/10
                  transition
                "
              />
            </div>
          </div>
        )}

        {/* Receive flow */}
        {type === "receive" && (
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-600">
            You’ll be able to generate account details after continuing.
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="
              flex-1 py-3 rounded-xl
              border border-neutral-200
              text-sm font-medium text-neutral-600
              hover:bg-neutral-50
              transition
            "
          >
            Cancel
          </button>

          <button
            disabled={type !== "receive" && !amount}
            className="
              flex-1 py-3 rounded-xl
              bg-brand-orange text-white
              text-sm font-semibold
              hover:bg-brand-orange-hover
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            {config.cta}
          </button>
        </div>
      </div>
    </Modal>
  );
}
