"use client";

import { useState } from "react";

interface LeadCaptureScreenProps {
  onSubmit: (firstName: string, mobile: string, email: string) => void;
}

const MOBILE_PATTERN = /^(\+?61|0)4\d{8}$/;

/** Captured right after the quick questions, before the estimate — so a lead is saved even if they drop off. */
export default function LeadCaptureScreen({ onSubmit }: LeadCaptureScreenProps) {
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const mobileValid = MOBILE_PATTERN.test(mobile.replace(/\s+/g, ""));
  const canSubmit = firstName.trim().length > 0 && mobileValid;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-slate">
        Almost there. We&apos;ll use this to save your estimate and, if you&apos;d like, have someone
        reach out.
      </p>

      <label className="block">
        <span className="mb-1 block text-sm text-slate">First name</span>
        <input
          type="text"
          autoFocus
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Your first name"
          className="min-h-tap w-full rounded-xl border border-slate/25 bg-white px-4 text-lg text-ink outline-none focus:border-brand"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-slate">Mobile</span>
        <input
          type="tel"
          inputMode="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="04xx xxx xxx"
          className="min-h-tap w-full rounded-xl border border-slate/25 bg-white px-4 text-lg text-ink outline-none focus:border-brand"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-slate">Email (optional)</span>
        <input
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-h-tap w-full rounded-xl border border-slate/25 bg-white px-4 text-lg text-ink outline-none focus:border-brand"
        />
      </label>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => onSubmit(firstName.trim(), mobile.trim(), email.trim())}
        className="min-h-tap mt-2 w-full rounded-xl bg-brand text-lg font-semibold text-white transition-opacity disabled:opacity-40"
      >
        See my estimate
      </button>
    </div>
  );
}
