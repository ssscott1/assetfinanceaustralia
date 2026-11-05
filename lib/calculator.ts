export interface RepaymentInputs {
  amountFinanced: number;
  annualRatePct: number;
  termMonths: number;
  /** Residual/balloon owing at the end of the term, if any. */
  balloon?: number;
  establishmentFee?: number | null;
  monthlyAccountFee?: number | null;
}

export interface RepaymentResult {
  monthly: number;
  weekly: number;
  totalRepayable: number;
}

/**
 * Standard reducing-balance amortisation, solved for a fixed payment with
 * an optional balloon (future value) at the end of the term. The
 * establishment fee is capitalised into the financed amount; the monthly
 * account fee is added on top of the calculated payment.
 */
export function calculateRepayments(inputs: RepaymentInputs): RepaymentResult {
  const { amountFinanced, annualRatePct, termMonths, balloon = 0 } = inputs;
  const establishmentFee = inputs.establishmentFee ?? 0;
  const monthlyAccountFee = inputs.monthlyAccountFee ?? 0;

  const principal = amountFinanced + establishmentFee;
  const monthlyRate = annualRatePct / 100 / 12;

  let basePayment: number;
  if (monthlyRate === 0) {
    basePayment = (principal - balloon) / termMonths;
  } else {
    const growth = Math.pow(1 + monthlyRate, termMonths);
    basePayment = ((principal - balloon / growth) * monthlyRate) / (1 - 1 / growth);
  }

  const monthly = basePayment + monthlyAccountFee;
  const weekly = (monthly * 12) / 52;
  const totalRepayable = monthly * termMonths + balloon;

  return {
    monthly: round2(monthly),
    weekly: round2(weekly),
    totalRepayable: round2(totalRepayable),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(n: number): string {
  return n.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  });
}
