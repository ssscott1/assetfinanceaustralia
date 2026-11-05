"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionScreen from "./QuestionScreen";
import ChoiceButton from "./ChoiceButton";
import AmountScreen from "./AmountScreen";
import LeadCaptureScreen from "./LeadCaptureScreen";
import CommercialAbnScreen from "./CommercialAbnScreen";
import ResultsScreen from "./ResultsScreen";
import { consumerTier, commercialTier } from "@/lib/tierEngine";
import { loadQuoteState, saveQuoteState, recordLeadEvent } from "@/lib/storage";
import { track, type QuoteState, type CustomerType, type EmploymentType } from "@/lib/types";

type Step =
  | "customerType"
  | "assetCondition"
  | "amount"
  | "consumerEmployment"
  | "consumerHomeowner"
  | "commercialAbn"
  | "commercialTradingYears"
  | "commercialGst"
  | "commercialPropertyOwner"
  | "lead"
  | "results";

const EMPTY_STATE: QuoteState = {
  common: {},
  consumer: {},
  commercial: {},
  lead: {},
  updatedAt: new Date().toISOString(),
};

function nextAfter(step: Step, state: QuoteState): Step {
  switch (step) {
    case "customerType":
      return "assetCondition";
    case "assetCondition":
      return "amount";
    case "amount":
      return state.common.customerType?.value === "commercial" ? "commercialAbn" : "consumerEmployment";
    case "consumerEmployment":
      return "consumerHomeowner";
    case "consumerHomeowner":
      return "lead";
    case "commercialAbn":
      return state.commercial.abnLookupSucceeded && state.commercial.tradingTwoYearsPlus !== undefined
        ? "commercialPropertyOwner"
        : "commercialTradingYears";
    case "commercialTradingYears":
      return "commercialGst";
    case "commercialGst":
      return "commercialPropertyOwner";
    case "commercialPropertyOwner":
      return "lead";
    case "lead":
      return "results";
    case "results":
      return "results";
  }
}

// Fixed step order per branch, used only to render the progress bar.
const CONSUMER_ORDER: Step[] = [
  "customerType",
  "assetCondition",
  "amount",
  "consumerEmployment",
  "consumerHomeowner",
  "lead",
  "results",
];
const COMMERCIAL_ORDER: Step[] = [
  "customerType",
  "assetCondition",
  "amount",
  "commercialAbn",
  "commercialPropertyOwner",
  "lead",
  "results",
];

export default function QuoteFlow() {
  const router = useRouter();
  const [state, setState] = useState<QuoteState>(EMPTY_STATE);
  const [step, setStep] = useState<Step>("customerType");
  const [history, setHistory] = useState<Step[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Resume from a saved session, if any.
  useEffect(() => {
    const saved = loadQuoteState();
    if (saved) {
      setState(saved);
      if (!saved.reachedResults) {
        // Resume at the first unanswered step for their branch.
        if (!saved.common.customerType) setStep("customerType");
        else if (!saved.common.assetCondition) setStep("assetCondition");
        else if (saved.common.amount === undefined) setStep("amount");
        else if (saved.common.customerType.value === "consumer") {
          if (!saved.consumer.employmentType) setStep("consumerEmployment");
          else if (saved.consumer.homeowner === undefined) setStep("consumerHomeowner");
          else if (!saved.lead.mobile) setStep("lead");
          else setStep("results");
        } else {
          if (saved.commercial.propertyOwner === undefined) setStep("commercialAbn");
          else if (!saved.lead.mobile) setStep("lead");
          else setStep("results");
        }
      } else {
        setStep("results");
      }
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hydrated) saveQuoteState({ ...state, updatedAt: new Date().toISOString() });
  }, [state, hydrated]);

  function goTo(nextStep: Step) {
    setHistory((h) => [...h, step]);
    setStep(nextStep);
  }

  function goBack() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const copy = [...h];
      const prev = copy.pop()!;
      setStep(prev);
      return copy;
    });
  }

  const order = state.common.customerType?.value === "commercial" ? COMMERCIAL_ORDER : CONSUMER_ORDER;
  const progress = useMemo(() => {
    const idx = order.indexOf(step);
    return idx === -1 ? 0 : (idx + 1) / order.length;
  }, [order, step]);

  const tier = useMemo(() => {
    if (state.common.customerType?.value === "consumer") {
      if (!state.consumer.employmentType || state.consumer.homeowner === undefined) return null;
      return consumerTier(state.consumer.employmentType.value, state.consumer.homeowner.value);
    }
    if (state.common.customerType?.value === "commercial") {
      if (
        state.commercial.tradingTwoYearsPlus === undefined ||
        state.commercial.gstRegistered === undefined ||
        state.commercial.propertyOwner === undefined
      )
        return null;
      return commercialTier(
        state.commercial.tradingTwoYearsPlus.value,
        state.commercial.gstRegistered.value,
        state.commercial.propertyOwner.value
      );
    }
    return null;
  }, [state]);

  const amountFinanced = Math.max(
    0,
    (state.common.amount?.value ?? 0) - (state.common.deposit?.value ?? 0) - (state.common.tradeIn?.value ?? 0)
  );

  if (!hydrated) return null;

  switch (step) {
    case "customerType":
      return (
        <QuestionScreen progress={progress} heading="Is this for you or your business?">
          <ChoiceButton
            label="For me"
            sublabel="Personal use"
            onClick={() => {
              setState((s) => ({ ...s, common: { ...s.common, customerType: track<CustomerType>("consumer", "user_input") } }));
              goTo("assetCondition");
            }}
          />
          <ChoiceButton
            label="For my business"
            onClick={() => {
              setState((s) => ({ ...s, common: { ...s.common, customerType: track<CustomerType>("commercial", "user_input") } }));
              goTo("assetCondition");
            }}
          />
        </QuestionScreen>
      );

    case "assetCondition":
      return (
        <QuestionScreen progress={progress} onBack={goBack} heading="Is the asset new or used?">
          <ChoiceButton
            label="New"
            onClick={() => {
              setState((s) => ({ ...s, common: { ...s.common, assetCondition: track("new", "user_input") } }));
              goTo("amount");
            }}
          />
          <ChoiceButton
            label="Used"
            onClick={() => {
              setState((s) => ({ ...s, common: { ...s.common, assetCondition: track("used", "user_input") } }));
              goTo("amount");
            }}
          />
        </QuestionScreen>
      );

    case "amount":
      return (
        <QuestionScreen progress={progress} onBack={goBack} heading="How much do you want to borrow?">
          <AmountScreen
            initialAmount={state.common.amount?.value}
            initialDeposit={state.common.deposit?.value}
            initialTradeIn={state.common.tradeIn?.value}
            onSubmit={(amount, deposit, tradeIn) => {
              setState((s) => ({
                ...s,
                common: {
                  ...s.common,
                  amount: track(amount, "user_input"),
                  deposit: track(deposit, "user_input"),
                  tradeIn: track(tradeIn, "user_input"),
                },
              }));
              goTo(nextAfter("amount", state));
            }}
          />
        </QuestionScreen>
      );

    case "consumerEmployment":
      return (
        <QuestionScreen progress={progress} onBack={goBack} heading="What's your employment type?">
          {(["full_time", "part_time", "self_employed"] as EmploymentType[]).map((type) => (
            <ChoiceButton
              key={type}
              label={type === "full_time" ? "Full-time" : type === "part_time" ? "Part-time" : "Self-employed"}
              onClick={() => {
                setState((s) => ({ ...s, consumer: { ...s.consumer, employmentType: track(type, "user_input") } }));
                goTo("consumerHomeowner");
              }}
            />
          ))}
        </QuestionScreen>
      );

    case "consumerHomeowner":
      return (
        <QuestionScreen progress={progress} onBack={goBack} heading="Are you a homeowner?" subheading="Including if you have a mortgage.">
          <ChoiceButton
            label="Yes"
            onClick={() => {
              setState((s) => ({ ...s, consumer: { ...s.consumer, homeowner: track(true, "user_input") } }));
              goTo("lead");
            }}
          />
          <ChoiceButton
            label="No"
            onClick={() => {
              setState((s) => ({ ...s, consumer: { ...s.consumer, homeowner: track(false, "user_input") } }));
              goTo("lead");
            }}
          />
        </QuestionScreen>
      );

    case "commercialAbn":
      return (
        <QuestionScreen progress={progress} onBack={goBack} heading="What's your ABN?">
          <CommercialAbnScreen
            onResolved={({ abn, businessName, tradingTwoYearsPlusSuggested, lookupSucceeded }) => {
              setState((s) => ({
                ...s,
                commercial: {
                  ...s.commercial,
                  abn: abn ? track(abn, "user_input") : s.commercial.abn,
                  businessName: businessName ? track(businessName, "abn_lookup") : s.commercial.businessName,
                  tradingTwoYearsPlus:
                    lookupSucceeded && tradingTwoYearsPlusSuggested !== undefined
                      ? track(tradingTwoYearsPlusSuggested, "derived")
                      : s.commercial.tradingTwoYearsPlus,
                  abnLookupAttempted: true,
                  abnLookupSucceeded: lookupSucceeded,
                },
              }));
              goTo(lookupSucceeded && tradingTwoYearsPlusSuggested !== undefined ? "commercialGst" : "commercialTradingYears");
            }}
            onSkip={() => goTo("commercialTradingYears")}
          />
        </QuestionScreen>
      );

    case "commercialTradingYears":
      return (
        <QuestionScreen progress={progress} onBack={goBack} heading="Has the business been trading for more than two years?">
          <ChoiceButton
            label="Yes"
            onClick={() => {
              setState((s) => ({ ...s, commercial: { ...s.commercial, tradingTwoYearsPlus: track(true, "user_input") } }));
              goTo("commercialGst");
            }}
          />
          <ChoiceButton
            label="No"
            onClick={() => {
              setState((s) => ({ ...s, commercial: { ...s.commercial, tradingTwoYearsPlus: track(false, "user_input") } }));
              goTo("commercialGst");
            }}
          />
        </QuestionScreen>
      );

    case "commercialGst":
      return (
        <QuestionScreen progress={progress} onBack={goBack} heading="Is the business registered for GST?">
          <ChoiceButton
            label="Yes"
            onClick={() => {
              setState((s) => ({ ...s, commercial: { ...s.commercial, gstRegistered: track(true, "user_input") } }));
              goTo("commercialPropertyOwner");
            }}
          />
          <ChoiceButton
            label="No"
            onClick={() => {
              setState((s) => ({ ...s, commercial: { ...s.commercial, gstRegistered: track(false, "user_input") } }));
              goTo("commercialPropertyOwner");
            }}
          />
        </QuestionScreen>
      );

    case "commercialPropertyOwner":
      return (
        <QuestionScreen progress={progress} onBack={goBack} heading="Is the business owner a property owner?">
          <ChoiceButton
            label="Yes"
            onClick={() => {
              setState((s) => ({ ...s, commercial: { ...s.commercial, propertyOwner: track(true, "user_input") } }));
              goTo("lead");
            }}
          />
          <ChoiceButton
            label="No"
            onClick={() => {
              setState((s) => ({ ...s, commercial: { ...s.commercial, propertyOwner: track(false, "user_input") } }));
              goTo("lead");
            }}
          />
        </QuestionScreen>
      );

    case "lead":
      return (
        <QuestionScreen progress={progress} onBack={goBack} heading="Who should we save this for?">
          <LeadCaptureScreen
            onSubmit={(firstName, mobile, email) => {
              const lead = {
                firstName: track(firstName, "user_input" as const),
                mobile: track(mobile, "user_input" as const),
                email: email ? track(email, "user_input" as const) : undefined,
              };
              setState((s) => ({ ...s, lead, reachedResults: true }));
              recordLeadEvent({ type: "lead_captured", firstName, mobile, email });
              goTo("results");
            }}
          />
        </QuestionScreen>
      );

    case "results": {
      if (!tier || !state.common.customerType || !state.common.assetCondition) {
        // Shouldn't happen in normal flow — guards against a corrupted resume.
        return (
          <QuestionScreen progress={1} heading="Let's start again" subheading="Something about your previous answers didn't carry through.">
            <ChoiceButton
              label="Start over"
              onClick={() => {
                setState(EMPTY_STATE);
                setHistory([]);
                setStep("customerType");
              }}
            />
          </QuestionScreen>
        );
      }
      return (
        <ResultsScreen
          customerType={state.common.customerType.value}
          tier={tier}
          assetCondition={state.common.assetCondition.value}
          amountFinanced={amountFinanced}
          onStartApplication={() => {
            setState((s) => ({ ...s, startedApplication: true }));
            router.push("/application");
          }}
          onCallMeBack={() => {
            setState((s) => ({ ...s, calledBackAt: new Date().toISOString() }));
            recordLeadEvent({ type: "call_me_back", firstName: state.lead.firstName?.value, mobile: state.lead.mobile?.value });
          }}
        />
      );
    }
  }
}
