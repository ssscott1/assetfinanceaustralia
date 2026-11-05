import type { Tier } from "./types";

/**
 * Lender tier and rate configuration.
 *
 * This is the single, versioned source of truth for tier rates. Per the
 * build spec, tier mapping and rates are configuration, not hard-coded
 * logic, and must be confirmed by Scott before go-live.
 *
 * Interim values are the ones supplied in the build spec (commercial A 8%,
 * B 9%, C 12%; consumer = commercial + 1%). Everything marked `null` is an
 * open item — see "Open items" in the build spec doc. The app is built to
 * fail closed on missing data (e.g. it will not show a consumer interest
 * rate without a comparison rate), so shipping with these nulls is safe,
 * just incomplete.
 */
export const rateConfig = {
  version: "2026-11-05",

  commercial: {
    A: { rate: 8.0 },
    B: { rate: 9.0 },
    C: { rate: 12.0 },
  } satisfies Record<Tier, { rate: number }>,

  consumer: {
    // TBD: comparisonRate must be supplied before a consumer interest rate
    // can be shown (NCCP requires it alongside any advertised rate). Until
    // then the UI shows repayment estimates only, with the rate withheld.
    A: { rate: 9.0, comparisonRate: null as number | null },
    B: { rate: 10.0, comparisonRate: null as number | null },
    C: { rate: 13.0, comparisonRate: null as number | null },
  } satisfies Record<Tier, { rate: number; comparisonRate: number | null }>,

  consumerMarginOverCommercial: 1.0,

  /** TBD: additive rate loading applied when the asset is used. */
  usedAssetLoading: null as number | null,

  /** TBD: one-off fee added to the amount financed, if any. */
  establishmentFee: null as number | null,

  /** TBD: fee added to each repayment period, if any. */
  monthlyAccountFee: null as number | null,

  /**
   * TBD: half-width of the indicative rate range shown around the point
   * rate above (e.g. 0.5 would show 8.5%–9.5% for an 9% point rate). Until
   * Scott supplies a real spread, the UI shows the point rate as both ends
   * of the range rather than inventing a spread.
   */
  rateSpreadPct: null as number | null,

  loanTermMonths: { min: 12, max: 84, default: 60 },

  /** TBD: confirm minimum and maximum loan amounts. */
  loanAmount: { min: 5000, max: null as number | null },
} as const;

export const tierPlainLabel: Record<Tier, string> = {
  A: "Our best rates",
  B: "Standard rates",
  C: "Specialist rates",
};

export const tierDescription: Record<Tier, string> = {
  A: "Prime lenders. The lowest rates and fastest turnaround, for the strongest profiles.",
  B: "Mainstream lenders. Solid, mid-range rates.",
  C: "Specialist lenders. Higher rates, for profiles mainstream lenders find harder to approve.",
};

export const mandatoryEstimateStatement =
  "These are estimates, not lender offers or approvals. No credit check has been done. Your final lender, rate, fees and repayments may change after a full application.";
