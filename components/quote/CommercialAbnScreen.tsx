"use client";

import { useState } from "react";
import type { AbnLookupResult } from "@/app/api/abn-lookup/route";

interface CommercialAbnScreenProps {
  onResolved: (result: {
    abn?: string;
    businessName?: string;
    tradingTwoYearsPlusSuggested?: boolean;
    lookupSucceeded: boolean;
  }) => void;
  onSkip: () => void;
}

/**
 * ABN entry with a lookup attempt. No ABR GUID is configured yet, so the
 * lookup call always reports "unavailable" and this screen hands straight
 * to the manual fallback questions — exactly the "if lookup fails... ask
 * directly" path the build spec describes.
 */
export default function CommercialAbnScreen({ onResolved, onSkip }: CommercialAbnScreenProps) {
  const [abn, setAbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abnValid = /^\d{11}$/.test(abn.replace(/\s+/g, ""));

  async function lookup() {
    setLoading(true);
    setError(null);
    try {
      const cleanAbn = abn.replace(/\s+/g, "");
      const res = await fetch(`/api/abn-lookup?abn=${cleanAbn}`);
      const data: AbnLookupResult = await res.json();
      if (data.available) {
        onResolved({
          abn: cleanAbn,
          businessName: data.businessName,
          tradingTwoYearsPlusSuggested: data.tradingTwoYearsPlusSuggested,
          lookupSucceeded: true,
        });
      } else {
        // Lookup unavailable — hand to the manual fallback questions, ABN still recorded.
        onResolved({ abn: cleanAbn, lookupSucceeded: false });
      }
    } catch {
      setError("Couldn't look that up right now — no problem, we'll ask a couple of questions instead.");
      onResolved({ abn: abn.replace(/\s+/g, ""), lookupSucceeded: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-slate">
        Enter your ABN and we&apos;ll try to fill in the rest. If we can&apos;t find it, we&apos;ll
        just ask a couple of quick questions.
      </p>

      <label className="block">
        <span className="mb-1 block text-sm text-slate">ABN</span>
        <input
          type="text"
          inputMode="numeric"
          autoFocus
          value={abn}
          onChange={(e) => setAbn(e.target.value.replace(/[^0-9 ]/g, ""))}
          placeholder="11 digit ABN"
          className="min-h-tap w-full rounded-xl border border-slate/25 bg-white px-4 text-lg text-ink outline-none focus:border-brand"
        />
      </label>

      {error && <p className="text-sm text-warning">{error}</p>}

      <button
        type="button"
        disabled={!abnValid || loading}
        onClick={lookup}
        className="min-h-tap w-full rounded-xl bg-brand text-lg font-semibold text-white transition-opacity disabled:opacity-40"
      >
        {loading ? "Looking up..." : "Continue"}
      </button>

      <button type="button" onClick={onSkip} className="self-center text-sm font-medium text-slate">
        I don&apos;t have my ABN handy
      </button>
    </div>
  );
}
