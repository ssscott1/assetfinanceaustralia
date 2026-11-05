"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Field, { inputClass } from "./Field";
import ChoiceButton from "@/components/quote/ChoiceButton";
import {
  loadQuoteState,
  loadApplicationState,
  saveApplicationState,
  recordLeadEvent,
} from "@/lib/storage";
import { track, type QuoteState, type ApplicationState, type BorrowingStructure } from "@/lib/types";
import { formatCurrency } from "@/lib/calculator";

const STRUCTURES: { value: BorrowingStructure; label: string }[] = [
  { value: "sole_trader", label: "Sole trader" },
  { value: "partnership", label: "Partnership" },
  { value: "company", label: "Company" },
  { value: "trust", label: "Trust" },
];

export default function ApplicationForm() {
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteState | null>(null);
  const [app, setApp] = useState<ApplicationState>({ commercial: {}, consumer: {} });
  const [submitted, setSubmitted] = useState(false);

  // Local-only draft fields (not persisted — see note on the submit handler).
  const [structure, setStructure] = useState<BorrowingStructure | null>(null);
  const [directors, setDirectors] = useState("");
  const [trusteeType, setTrusteeType] = useState<"individual" | "corporate" | null>(null);
  const [beneficiaries, setBeneficiaries] = useState("");
  const [assetSupplier, setAssetSupplier] = useState("");
  const [assetSeller, setAssetSeller] = useState<"dealer" | "private" | null>(null);
  const [assetKms, setAssetKms] = useState("");
  const [financialsNote, setFinancialsNote] = useState("");

  const [licence, setLicence] = useState("");
  const [medicare, setMedicare] = useState("");
  const [address, setAddress] = useState("");
  const [addressHistory, setAddressHistory] = useState("");
  const [incomeDetail, setIncomeDetail] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [tenure, setTenure] = useState("");
  const [livingExpenses, setLivingExpenses] = useState("");
  const [liabilities, setLiabilities] = useState("");
  const [creditConsent, setCreditConsent] = useState(false);

  useEffect(() => {
    const savedQuote = loadQuoteState();
    if (!savedQuote || !savedQuote.common.customerType) {
      router.replace("/quote");
      return;
    }
    setQuote(savedQuote);
    const savedApp = loadApplicationState();
    if (savedApp) setApp(savedApp);
  }, [router]);

  if (!quote || !quote.common.customerType) return null;

  const isCommercial = quote.common.customerType.value === "commercial";
  const amount = quote.common.amount?.value ?? 0;

  function handleSubmit() {
    if (!quote || !quote.common.customerType) return;
    const now = new Date().toISOString();
    const next: ApplicationState = {
      commercial: isCommercial
        ? {
            borrowingStructure: structure ? track(structure, "user_input") : undefined,
            directorsAndGuarantors: directors ? track(directors, "user_input") : undefined,
            trusteeType: trusteeType ? track(trusteeType, "user_input") : undefined,
            beneficiaries: beneficiaries ? track(beneficiaries, "user_input") : undefined,
            assetSupplierOrListing: assetSupplier ? track(assetSupplier, "user_input") : undefined,
            assetSeller: assetSeller ? track(assetSeller, "user_input") : undefined,
            assetKmsOrHours: assetKms ? track(assetKms, "user_input") : undefined,
            financialsNote: financialsNote ? track(financialsNote, "user_input") : undefined,
          }
        : {},
      consumer: !isCommercial
        ? {
            licenceNumber: licence ? track(licence, "user_input") : undefined,
            medicareNumber: medicare ? track(medicare, "user_input") : undefined,
            residentialAddress: address ? track(address, "user_input") : undefined,
            addressHistory: addressHistory ? track(addressHistory, "user_input") : undefined,
            incomeDetail: incomeDetail ? track(incomeDetail, "user_input") : undefined,
            employerName: employerName ? track(employerName, "user_input") : undefined,
            employmentTenure: tenure ? track(tenure, "user_input") : undefined,
            livingExpenses: livingExpenses ? track(Number(livingExpenses), "user_input") : undefined,
            existingLiabilities: liabilities ? track(liabilities, "user_input") : undefined,
            assetSellerOrListing: assetSupplier ? track(assetSupplier, "user_input") : undefined,
            assetSeller: assetSeller ? track(assetSeller, "user_input") : undefined,
            creditCheckConsent: track(creditConsent, "user_input"),
          }
        : {},
      submittedAt: now,
    };
    saveApplicationState(next);
    // TODO(backend): this only saves locally — once a backend exists, POST
    // the full application (quote answers + these additions) to it here.
    recordLeadEvent({ type: "application_submitted", submittedAt: now, customerType: quote.common.customerType.value });
    setSubmitted(true);
    router.push("/confirmation");
  }

  const canSubmit = isCommercial
    ? structure !== null
    : creditConsent && licence.trim().length > 0;

  return (
    <div className="min-h-dvh bg-paper pb-28">
      <div className="mx-auto w-full max-w-md px-5 py-8">
        <h1 className="text-2xl font-bold text-ink">Your application</h1>
        <p className="mt-1 text-sm text-slate">
          We&apos;ve carried over what you already told us. Anything marked{" "}
          <span className="font-medium">Declared · unverified</span> is yours to correct.
        </p>

        <section className="mt-6 rounded-2xl border border-slate/15 bg-white p-5">
          <h2 className="font-semibold text-ink">What you&apos;re financing</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Amount" value={formatCurrency(amount)} declared />
            <Row label="Condition" value={quote.common.assetCondition?.value === "used" ? "Used" : "New"} declared />
            {isCommercial ? (
              <Row label="Business" value={quote.commercial.businessName?.value ?? "Not yet provided"} declared={!!quote.commercial.businessName} />
            ) : (
              <Row label="Employment" value={quote.consumer.employmentType?.value?.replace("_", " ") ?? "—"} declared />
            )}
          </dl>
        </section>

        {isCommercial ? (
          <section className="mt-6 flex flex-col gap-4">
            <h2 className="font-semibold text-ink">Business structure</h2>
            <div className="grid grid-cols-2 gap-3">
              {STRUCTURES.map((s) => (
                <ChoiceButton key={s.value} label={s.label} selected={structure === s.value} onClick={() => setStructure(s.value)} />
              ))}
            </div>

            {structure === "company" && (
              <Field label="Directors and guarantors">
                <textarea
                  value={directors}
                  onChange={(e) => setDirectors(e.target.value)}
                  placeholder="Name, role, and whether they'll guarantee the loan"
                  className={`${inputClass} min-h-24 py-3`}
                />
              </Field>
            )}

            {structure === "trust" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ChoiceButton label="Individual trustee" selected={trusteeType === "individual"} onClick={() => setTrusteeType("individual")} />
                  <ChoiceButton label="Corporate trustee" selected={trusteeType === "corporate"} onClick={() => setTrusteeType("corporate")} />
                </div>
                <Field label="Beneficiaries">
                  <input value={beneficiaries} onChange={(e) => setBeneficiaries(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Trust deed">
                  <input type="file" className="block w-full text-sm text-slate" />
                  <span className="mt-1 block text-xs text-slate">Not uploaded until a backend is connected — kept for this session only.</span>
                </Field>
              </>
            )}

            <h2 className="mt-2 font-semibold text-ink">Asset details</h2>
            <Field label="Supplier quote or listing">
              <input value={assetSupplier} onChange={(e) => setAssetSupplier(e.target.value)} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <ChoiceButton label="Dealer" selected={assetSeller === "dealer"} onClick={() => setAssetSeller("dealer")} />
              <ChoiceButton label="Private sale" selected={assetSeller === "private"} onClick={() => setAssetSeller("private")} />
            </div>
            <Field label="Kilometres or hours (if used)">
              <input value={assetKms} onChange={(e) => setAssetKms(e.target.value)} className={inputClass} />
            </Field>

            <h2 className="mt-2 font-semibold text-ink">Financials</h2>
            <p className="text-sm text-slate">
              What we ask for depends on your tier — low-doc or full financials. We&apos;ll confirm
              exactly what&apos;s needed once we&apos;ve reviewed this.
            </p>
            <Field label="Anything you'd like to add">
              <textarea
                value={financialsNote}
                onChange={(e) => setFinancialsNote(e.target.value)}
                className={`${inputClass} min-h-20 py-3`}
              />
            </Field>
          </section>
        ) : (
          <section className="mt-6 flex flex-col gap-4">
            <h2 className="font-semibold text-ink">Identity</h2>
            <Field label="Driver licence number">
              <input value={licence} onChange={(e) => setLicence(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Medicare number (optional)">
              <input value={medicare} onChange={(e) => setMedicare(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Residential address">
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Address history (last 2 years)">
              <textarea value={addressHistory} onChange={(e) => setAddressHistory(e.target.value)} className={`${inputClass} min-h-20 py-3`} />
            </Field>

            <h2 className="mt-2 font-semibold text-ink">Income</h2>
            <Field label="Employer">
              <input value={employerName} onChange={(e) => setEmployerName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Time with this employer">
              <input value={tenure} onChange={(e) => setTenure(e.target.value)} placeholder="e.g. 2 years 3 months" className={inputClass} />
            </Field>
            <Field label="Income detail">
              <textarea value={incomeDetail} onChange={(e) => setIncomeDetail(e.target.value)} className={`${inputClass} min-h-20 py-3`} />
            </Field>
            <Field label="Payslips">
              <input type="file" multiple className="block w-full text-sm text-slate" />
              <span className="mt-1 block text-xs text-slate">Not uploaded until a backend is connected — kept for this session only.</span>
            </Field>

            <h2 className="mt-2 font-semibold text-ink">Expenses and liabilities</h2>
            <Field label="Monthly living expenses">
              <div className="flex items-center rounded-xl border border-slate/25 bg-white px-4">
                <span className="text-slate">$</span>
                <input
                  inputMode="numeric"
                  value={livingExpenses}
                  onChange={(e) => setLivingExpenses(e.target.value.replace(/[^0-9]/g, ""))}
                  className="min-h-tap w-full bg-transparent pl-1 text-ink outline-none"
                />
              </div>
            </Field>
            <Field label="Existing liabilities">
              <textarea value={liabilities} onChange={(e) => setLiabilities(e.target.value)} placeholder="Loans, credit cards, other finance" className={`${inputClass} min-h-20 py-3`} />
            </Field>

            <h2 className="mt-2 font-semibold text-ink">Asset details</h2>
            <Field label="Listing or dealer quote">
              <input value={assetSupplier} onChange={(e) => setAssetSupplier(e.target.value)} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <ChoiceButton label="Dealer" selected={assetSeller === "dealer"} onClick={() => setAssetSeller("dealer")} />
              <ChoiceButton label="Private sale" selected={assetSeller === "private"} onClick={() => setAssetSeller("private")} />
            </div>

            <h2 className="mt-2 font-semibold text-ink">Credit check consent</h2>
            <label className="flex items-start gap-3 rounded-xl border border-slate/20 bg-white p-4">
              <input
                type="checkbox"
                checked={creditConsent}
                onChange={(e) => setCreditConsent(e.target.checked)}
                className="mt-1 h-5 w-5 accent-brand"
              />
              <span className="text-sm text-ink">
                I consent to a credit check being performed as part of this application. No credit
                check has been done until I tick this box and submit.
              </span>
            </label>
          </section>
        )}

        <div className="fixed inset-x-0 bottom-0 border-t border-slate/15 bg-paper/95 p-4 backdrop-blur">
          <div className="mx-auto max-w-md">
            <button
              type="button"
              disabled={!canSubmit || submitted}
              onClick={handleSubmit}
              className="min-h-tap w-full rounded-xl bg-brand text-lg font-semibold text-white transition-opacity disabled:opacity-40"
            >
              Submit application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, declared }: { label: string; value: string; declared?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-center text-slate">
        {label}
        {declared && (
          <span className="ml-2 rounded-full bg-slate/10 px-1.5 py-0.5 text-[10px] font-medium text-slate">
            declared
          </span>
        )}
      </dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
