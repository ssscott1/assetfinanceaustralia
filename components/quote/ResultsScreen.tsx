"use client";

import { useMemo, useState } from "react";
import type { CustomerType, Tier } from "@/lib/types";
import { rateConfig, tierPlainLabel, tierDescription, mandatoryEstimateStatement } from "@/lib/rateConfig";
import { calculateRepayments, formatCurrency } from "@/lib/calculator";

interface ResultsScreenProps {
  customerType: CustomerType;
  tier: Tier;
  assetCondition: "new" | "used";
  amountFinanced: number;
  onStartApplication: () => void;
  onCallMeBack: () => void;
}

const ALL_TIERS: Tier[] = ["A", "B", "C"];

function effectiveRate(customerType: CustomerType, tier: Tier, isUsed: boolean): {
  rate: number;
  comparisonRate: number | null;
} {
  const commercialRate = rateConfig.commercial[tier].rate;
  const loading = isUsed ? rateConfig.usedAssetLoading ?? 0 : 0;

  if (customerType === "commercial") {
    return { rate: commercialRate + loading, comparisonRate: null };
  }
  const consumer = rateConfig.consumer[tier];
  return { rate: consumer.rate + loading, comparisonRate: consumer.comparisonRate };
}

export default function ResultsScreen({
  customerType,
  tier,
  assetCondition,
  amountFinanced,
  onStartApplication,
  onCallMeBack,
}: ResultsScreenProps) {
  const [termMonths, setTermMonths] = useState<number>(rateConfig.loanTermMonths.default);
  const [balloonPct, setBalloonPct] = useState(0);
  const [showOtherTiers, setShowOtherTiers] = useState(false);
  const [callBackConfirmed, setCallBackConfirmed] = useState(false);

  const isUsed = assetCondition === "used";
  const { rate, comparisonRate } = effectiveRate(customerType, tier, isUsed);
  // Fails closed: a consumer rate is never shown without its comparison rate.
  const canShowConsumerRate = customerType !== "consumer" || comparisonRate !== null;

  const balloon = Math.round(amountFinanced * (balloonPct / 100));

  const spread = rateConfig.rateSpreadPct ?? 0;
  const lowRate = Math.max(0, rate - spread);
  const highRate = rate + spread;

  const repaymentsLow = useMemo(
    () =>
      calculateRepayments({
        amountFinanced,
        annualRatePct: lowRate,
        termMonths,
        balloon,
        establishmentFee: rateConfig.establishmentFee,
        monthlyAccountFee: rateConfig.monthlyAccountFee,
      }),
    [amountFinanced, lowRate, termMonths, balloon]
  );
  const repaymentsHigh = useMemo(
    () =>
      calculateRepayments({
        amountFinanced,
        annualRatePct: highRate,
        termMonths,
        balloon,
        establishmentFee: rateConfig.establishmentFee,
        monthlyAccountFee: rateConfig.monthlyAccountFee,
      }),
    [amountFinanced, highRate, termMonths, balloon]
  );

  return (
    <div className="min-h-dvh bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-col px-5 py-8">
        <p className="font-semibold uppercase tracking-wide text-brand">{tierPlainLabel[tier]}</p>
        <p className="mt-1 text-sm text-slate">{tierDescription[tier]}</p>

        <div className="mt-6 rounded-2xl border border-slate/15 bg-white p-5">
          <p className="text-sm text-slate">Estimated repayments</p>
          <p className="mt-1 text-3xl font-bold text-ink">
            {formatCurrency(repaymentsLow.weekly)}
            {repaymentsHigh.weekly !== repaymentsLow.weekly && ` – ${formatCurrency(repaymentsHigh.weekly)}`}
            <span className="text-base font-normal text-slate"> / week</span>
          </p>
          <p className="mt-1 text-sm text-slate">
            or {formatCurrency(repaymentsLow.monthly)}
            {repaymentsHigh.monthly !== repaymentsLow.monthly && ` – ${formatCurrency(repaymentsHigh.monthly)}`}{" "}
            / month
          </p>

          {canShowConsumerRate ? (
            <p className="mt-3 text-sm text-ink">
              Estimated rate: <span className="font-semibold">{lowRate.toFixed(2)}%</span>
              {highRate !== lowRate && ` – ${highRate.toFixed(2)}%`} p.a.
              {customerType === "consumer" && comparisonRate !== null && (
                <> (comparison rate {comparisonRate.toFixed(2)}% p.a.)</>
              )}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate">
              Your personalised rate and comparison rate will be provided with your formal
              application.
            </p>
          )}

          <div className="mt-5 space-y-4 border-t border-slate/10 pt-4">
            <label className="block">
              <span className="mb-1 flex justify-between text-sm text-slate">
                <span>Term</span>
                <span className="font-medium text-ink">{termMonths} months</span>
              </span>
              <input
                type="range"
                min={rateConfig.loanTermMonths.min}
                max={rateConfig.loanTermMonths.max}
                step={6}
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full accent-brand"
              />
            </label>

            <label className="block">
              <span className="mb-1 flex justify-between text-sm text-slate">
                <span>Balloon payment</span>
                <span className="font-medium text-ink">{balloonPct}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={balloonPct}
                onChange={(e) => setBalloonPct(Number(e.target.value))}
                className="w-full accent-brand"
              />
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowOtherTiers((v) => !v)}
          className="mt-4 self-start text-sm font-medium text-brand"
        >
          {showOtherTiers ? "Hide" : "See"} indicative rates for other tiers
        </button>

        {showOtherTiers && (
          <div className="mt-2 divide-y divide-slate/10 rounded-xl border border-slate/15 bg-white">
            {ALL_TIERS.map((t) => {
              const r = effectiveRate(customerType, t, isUsed);
              const show = customerType !== "consumer" || r.comparisonRate !== null;
              return (
                <div key={t} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-ink">{tierPlainLabel[t]}</span>
                  <span className="text-sm font-medium text-ink">
                    {show ? `${r.rate.toFixed(2)}% p.a.` : "Provided with application"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-6 text-xs leading-relaxed text-slate">{mandatoryEstimateStatement}</p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onStartApplication}
            className="min-h-tap w-full rounded-xl bg-brand text-lg font-semibold text-white"
          >
            Start my application
          </button>
          <button
            type="button"
            disabled={callBackConfirmed}
            onClick={() => {
              onCallMeBack();
              setCallBackConfirmed(true);
            }}
            className="min-h-tap w-full rounded-xl border border-slate/25 bg-white text-lg font-semibold text-ink disabled:opacity-60"
          >
            {callBackConfirmed ? "We'll be in touch" : "Call me back"}
          </button>
        </div>

        {callBackConfirmed && (
          <p className="mt-3 text-center text-sm text-success">
            Thanks — we&apos;ve got your details and someone will call you back.
          </p>
        )}
      </div>
    </div>
  );
}
