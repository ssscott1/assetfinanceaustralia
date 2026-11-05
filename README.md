# Asset Finance Australia — Quote and Application Flow

A mobile-first quick-quote wizard and full application for asset finance,
built from the "Asset Finance Quote and Application Flow — Build Spec" doc.
Next.js (App Router) + TypeScript + Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — "Get my estimate" starts
the flow at `/quote`.

## What's built

- **`/quote`** — one question per screen (big tap targets, numeric keypad
  for amounts, progress bar, Back link). Branches into consumer or
  commercial questions after the opening three questions, captures a lead
  (name + mobile) before showing the estimate, then shows the tier result
  and a repayment calculator (adjustable term and balloon).
- **`/application`** — the full application, prefilled from the quote
  answers (marked "Declared · unverified"), with the consumer- or
  commercial-specific sections from the spec.
- **`/confirmation`** — shown after submitting the application.
- **`/api/abn-lookup`** — server route for ABR's ABN Lookup API.

## Important gaps — read before go-live

This was built under three explicit decisions, each with a real limitation:

1. **No backend yet.** Every answer, lead and application is stored in the
   browser's `localStorage` only (see `lib/storage.ts`). Nothing is visible
   outside the customer's own device, "abandoned lead" follow-ups to the
   broker or Vela don't fire anywhere real, and file inputs (payslips, trust
   deed) aren't actually uploaded. `lib/storage.ts` is written as a single
   choke point — swapping in a real backend (e.g. Supabase) means changing
   that one file, not the screens that call it.
2. **No ABN Lookup API key.** `ABN_LOOKUP_GUID` is unset, so
   `/api/abn-lookup` always reports the lookup as unavailable and the
   commercial branch falls straight to the manual fallback questions
   (trading 2+ years, GST registered) — which is also the spec's own
   fallback behaviour, so this is safe to ship as-is. Set the env var to
   turn real lookups on (see the comment at the top of
   `app/api/abn-lookup/route.ts` — note the ABR API does not expose GST
   status, so that question is always asked directly either way).
3. **Branding is a placeholder.** The spec asks for colours, fonts and
   button style to be taken from the live assetfinanceaustralia.com.au
   site; that site couldn't be reached from the build environment. Swap the
   hex values in `tailwind.config.ts` for the real brand tokens — every
   screen reads colour through those Tailwind names, so that's the only
   file that needs to change.

## Rates and tiers — "Open items for Scott" from the spec

`lib/rateConfig.ts` is the single, versioned source of truth for tier rates,
and is built to **fail closed**: a consumer interest rate is never shown
without its comparison rate (see `comparisonRate: null` below), so shipping
with incomplete config is safe, just incomplete. Still outstanding:

- Interim rates are in (commercial A 8%, B 9%, C 12%; consumer = commercial
  + 1%), but **consumer comparison rates are null** — until they're
  supplied, consumer screens show repayment estimates only, with the rate
  withheld, exactly as the spec requires.
- `usedAssetLoading`, `establishmentFee`, `monthlyAccountFee`,
  `rateSpreadPct` (for showing a true rate range instead of a point rate),
  and the maximum loan amount are all `null` / unset pending real numbers.
- The consumer and commercial tier mapping tables (`lib/tierEngine.ts`) are
  the spec's proposed mappings, marked "placeholder — confirm" in the doc —
  implemented as data tables, so changing an outcome is a one-line edit.

## Compliance behaviour worth knowing about

- The mandatory estimates statement is shown on every results screen
  (`mandatoryEstimateStatement` in `lib/rateConfig.ts`).
- No credit check happens anywhere in the quote flow; consent is only
  collected in the consumer application, and is off by default.
- Nothing here sends income, credit or finance details to any third-party
  script — there are no analytics or ad scripts in this project at all.

## Project structure

```
app/
  page.tsx                landing page -> CTA into /quote
  quote/page.tsx           quote wizard host
  application/page.tsx     full application host
  confirmation/page.tsx    post-submit screen
  api/abn-lookup/route.ts  ABR ABN Lookup proxy (graceful fallback)
components/
  quote/                   one component per question screen + QuoteFlow
                           (the state machine that sequences them)
  application/             the application form + shared field components
lib/
  types.ts                 all answer types; every field is tracked with
                           { value, source, timestamp, verified: false }
  rateConfig.ts            tier rates — the file to edit for real numbers
  tierEngine.ts             tier mapping tables
  calculator.ts             amortisation + balloon repayment maths
  storage.ts                 localStorage persistence (swap point for a backend)
```
