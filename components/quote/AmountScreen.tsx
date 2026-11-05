"use client";

import { useState } from "react";

interface AmountScreenProps {
  initialAmount?: number;
  initialDeposit?: number;
  initialTradeIn?: number;
  onSubmit: (amount: number, deposit: number, tradeIn: number) => void;
}

/** Numeric-keypad amount entry with a $ prefix, plus optional deposit/trade-in. */
export default function AmountScreen({
  initialAmount,
  initialDeposit,
  initialTradeIn,
  onSubmit,
}: AmountScreenProps) {
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : "");
  const [deposit, setDeposit] = useState(initialDeposit ? String(initialDeposit) : "");
  const [tradeIn, setTradeIn] = useState(initialTradeIn ? String(initialTradeIn) : "");
  const [showExtras, setShowExtras] = useState(Boolean(initialDeposit || initialTradeIn));

  const numericAmount = Number(amount) || 0;
  const canSubmit = numericAmount > 0;

  return (
    <div className="flex flex-col gap-5">
      <label className="block">
        <span className="sr-only">Amount to borrow</span>
        <div className="flex items-center rounded-xl border border-slate/25 bg-white px-4 py-3 focus-within:border-brand">
          <span className="text-3xl font-bold text-slate">$</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className="ml-1 min-h-tap w-full bg-transparent text-3xl font-bold text-ink outline-none"
          />
        </div>
      </label>

      {!showExtras && (
        <button
          type="button"
          onClick={() => setShowExtras(true)}
          className="self-start text-sm font-medium text-brand"
        >
          + Add a deposit or trade-in
        </button>
      )}

      {showExtras && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm text-slate">Deposit</span>
            <div className="flex items-center rounded-lg border border-slate/25 bg-white px-3 py-2">
              <span className="text-slate">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className="ml-1 w-full bg-transparent text-ink outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate">Trade-in</span>
            <div className="flex items-center rounded-lg border border-slate/25 bg-white px-3 py-2">
              <span className="text-slate">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={tradeIn}
                onChange={(e) => setTradeIn(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className="ml-1 w-full bg-transparent text-ink outline-none"
              />
            </div>
          </label>
        </div>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => onSubmit(numericAmount, Number(deposit) || 0, Number(tradeIn) || 0)}
        className="min-h-tap w-full rounded-xl bg-brand text-lg font-semibold text-white transition-opacity disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}
