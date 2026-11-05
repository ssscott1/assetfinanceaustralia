export type CustomerType = "consumer" | "commercial";
export type AssetCondition = "new" | "used";
export type EmploymentType = "full_time" | "part_time" | "self_employed";
export type Tier = "A" | "B" | "C";
export type BorrowingStructure = "sole_trader" | "partnership" | "company" | "trust";

/** How a field's value was obtained. Drives the "declared / unverified" badge in the application. */
export type AnswerSource = "user_input" | "abn_lookup" | "derived";

export interface AnswerMeta {
  source: AnswerSource;
  timestamp: string;
  /** Always false in this flow — nothing is verified until a human/lender checks it. */
  verified: false;
}

/** A value plus how/when we got it. Every quote and application field is stored this way. */
export interface Tracked<T> {
  value: T;
  meta: AnswerMeta;
}

export function track<T>(value: T, source: AnswerSource): Tracked<T> {
  return { value, meta: { source, timestamp: new Date().toISOString(), verified: false } };
}

export interface CommonAnswers {
  customerType?: Tracked<CustomerType>;
  assetCondition?: Tracked<AssetCondition>;
  assetYear?: Tracked<number>;
  amount?: Tracked<number>;
  deposit?: Tracked<number>;
  tradeIn?: Tracked<number>;
}

export interface ConsumerAnswers {
  employmentType?: Tracked<EmploymentType>;
  homeowner?: Tracked<boolean>;
}

export interface CommercialAnswers {
  abn?: Tracked<string>;
  businessName?: Tracked<string>;
  tradingTwoYearsPlus?: Tracked<boolean>;
  gstRegistered?: Tracked<boolean>;
  propertyOwner?: Tracked<boolean>;
  abnLookupAttempted?: boolean;
  abnLookupSucceeded?: boolean;
}

export interface LeadAnswers {
  firstName?: Tracked<string>;
  mobile?: Tracked<string>;
  email?: Tracked<string>;
}

/** Commercial-only fields collected in the full application (step 4). */
export interface CommercialApplicationAnswers {
  borrowingStructure?: Tracked<BorrowingStructure>;
  directorsAndGuarantors?: Tracked<string>;
  trusteeType?: Tracked<"individual" | "corporate">;
  beneficiaries?: Tracked<string>;
  trustDeedNoted?: Tracked<boolean>;
  assetSupplierOrListing?: Tracked<string>;
  assetSeller?: Tracked<"dealer" | "private">;
  assetKmsOrHours?: Tracked<string>;
  financialsNote?: Tracked<string>;
}

/** Consumer-only fields collected in the full application (step 4). */
export interface ConsumerApplicationAnswers {
  licenceNumber?: Tracked<string>;
  medicareNumber?: Tracked<string>;
  residentialAddress?: Tracked<string>;
  addressHistory?: Tracked<string>;
  incomeDetail?: Tracked<string>;
  employerName?: Tracked<string>;
  employmentTenure?: Tracked<string>;
  livingExpenses?: Tracked<number>;
  existingLiabilities?: Tracked<string>;
  assetSellerOrListing?: Tracked<string>;
  assetSeller?: Tracked<"dealer" | "private">;
  creditCheckConsent?: Tracked<boolean>;
}

export interface QuoteState {
  common: CommonAnswers;
  consumer: ConsumerAnswers;
  commercial: CommercialAnswers;
  lead: LeadAnswers;
  /** Set once the customer reaches and views the results screen. */
  reachedResults?: boolean;
  /** Set once "Start my application" is pressed. */
  startedApplication?: boolean;
  /** Set once "Call me back" is pressed, with a timestamp. */
  calledBackAt?: string;
  updatedAt: string;
}

export interface ApplicationState {
  commercial: CommercialApplicationAnswers;
  consumer: ConsumerApplicationAnswers;
  submittedAt?: string;
}

export interface TierResult {
  tier: Tier;
  label: string;
  description: string;
}
