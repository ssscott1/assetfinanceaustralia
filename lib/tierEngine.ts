import type { EmploymentType, Tier } from "./types";

/**
 * Tier mapping tables, matching the build spec exactly (section 4 and 5).
 * These are placeholder/proposed mappings pending Scott's confirmation
 * ("Open items for Scott", item 1) — but implemented as data tables, not
 * nested conditionals, so changing a single outcome is a one-line edit.
 */

const consumerTierTable: Array<{
  employmentType: EmploymentType;
  homeowner: boolean;
  tier: Tier;
}> = [
  { employmentType: "full_time", homeowner: true, tier: "A" },
  { employmentType: "self_employed", homeowner: true, tier: "A" },
  { employmentType: "full_time", homeowner: false, tier: "B" },
  { employmentType: "self_employed", homeowner: false, tier: "B" },
  { employmentType: "part_time", homeowner: true, tier: "B" },
  { employmentType: "part_time", homeowner: false, tier: "C" },
];

export function consumerTier(employmentType: EmploymentType, homeowner: boolean): Tier {
  const row = consumerTierTable.find(
    (r) => r.employmentType === employmentType && r.homeowner === homeowner
  );
  // Falls back to the most conservative tier if an unmapped combination
  // ever reaches this point (should not happen — every combination above
  // is covered).
  return row?.tier ?? "C";
}

/** `tradingTwoYearsPlus: null` means "any" — matches both true and false. */
const commercialTierTable: Array<{
  tradingTwoYearsPlus: boolean | null;
  gstRegistered: boolean | null;
  propertyOwner: boolean;
  tier: Tier;
}> = [
  { tradingTwoYearsPlus: true, gstRegistered: true, propertyOwner: true, tier: "A" },
  { tradingTwoYearsPlus: true, gstRegistered: true, propertyOwner: false, tier: "B" },
  { tradingTwoYearsPlus: true, gstRegistered: false, propertyOwner: true, tier: "B" },
  { tradingTwoYearsPlus: false, gstRegistered: null, propertyOwner: true, tier: "B" },
  { tradingTwoYearsPlus: false, gstRegistered: null, propertyOwner: false, tier: "C" },
  { tradingTwoYearsPlus: true, gstRegistered: false, propertyOwner: false, tier: "C" },
];

export function commercialTier(
  tradingTwoYearsPlus: boolean,
  gstRegistered: boolean,
  propertyOwner: boolean
): Tier {
  const row = commercialTierTable.find(
    (r) =>
      (r.tradingTwoYearsPlus === null || r.tradingTwoYearsPlus === tradingTwoYearsPlus) &&
      (r.gstRegistered === null || r.gstRegistered === gstRegistered) &&
      r.propertyOwner === propertyOwner
  );
  return row?.tier ?? "C";
}
