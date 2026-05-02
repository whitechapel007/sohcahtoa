'use client';

import { useState } from 'react';
import Modal from '@/components/core/Modal';
import { BuyFXIcon, SellFXIcon, ReceiveMoneyIcon } from '@/components/core/Icons';

interface ActionModalProps {
  type: 'buy' | 'sell' | 'receive' | null;
  onClose: () => void;
}

function ActionModal({ type, onClose }: ActionModalProps) {
  const titles = {
    buy: 'Buy FX',
    sell: 'Sell FX',
    receive: 'Receive Money',
  };

  const [amount, setAmount] = useState('');

  if (!type) return null;

  return (
    <Modal open={!!type} onClose={onClose} title={titles[type]}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-500">
          {type === 'buy' && 'Purchase foreign exchange at the current market rate.'}
          {type === 'sell' && 'Sell your foreign exchange holdings at the current rate.'}
          {type === 'receive' && 'Generate a receiving address or account details to receive money.'}
        </p>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold transition-all"
          >
            {type === 'buy' && 'Buy FX'}
            {type === 'sell' && 'Sell FX'}
            {type === 'receive' && 'Generate Details'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

const ACTIONS = [
  { key: 'buy' as const, label: 'Buy FX', icon: BuyFXIcon },
  { key: 'sell' as const, label: 'Sell FX', icon: SellFXIcon },
  { key: 'receive' as const, label: 'Receive money', icon: ReceiveMoneyIcon },
];

export default function FXActions() {
  const [modalType, setModalType] = useState<'buy' | 'sell' | 'receive' | null>(null);

  return (
    <>
      <div className="flex items-center gap-3">
        {ACTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setModalType(key)}
            className="
              flex flex-col items-center gap-2 px-4 py-3 rounded-xl
              border border-neutral-200 bg-white hover:border-brand-orange hover:bg-brand-orange-light
              group transition-all active:scale-95 min-w-[90px]
            "
          >
            <div className="w-9 h-9 rounded-full border border-neutral-200 group-hover:border-brand-orange-muted flex items-center justify-center transition-all">
              <Icon size={18} className="text-neutral-600 group-hover:text-brand-orange transition-colors" />
            </div>
            <span className="text-xs font-medium text-neutral-600 group-hover:text-brand-orange transition-colors whitespace-nowrap">
              {label}
            </span>
          </button>
        ))}
      </div>

      <ActionModal type={modalType} onClose={() => setModalType(null)} />
    </>
  );
}
