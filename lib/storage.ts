import type { ApplicationState, QuoteState } from "./types";

/**
 * Local persistence only, for now.
 *
 * No backend is wired up yet (decision: build local-only, add Supabase or
 * similar later). Every write here goes through these few functions so
 * swapping in real persistence — and real lead delivery to a CRM or to
 * Vela — only means changing this one file, not the screens that call it.
 */

const QUOTE_KEY = "afa.quote.v1";
const APPLICATION_KEY = "afa.application.v1";
const LEADS_KEY = "afa.leads.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadQuoteState(): QuoteState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(QUOTE_KEY);
    return raw ? (JSON.parse(raw) as QuoteState) : null;
  } catch {
    return null;
  }
}

export function saveQuoteState(state: QuoteState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(QUOTE_KEY, JSON.stringify(state));
  } catch {
    // Storage can fail (private browsing, quota). The flow still works in
    // memory for the current session; it just won't resume later.
  }
}

export function clearQuoteState(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(QUOTE_KEY);
}

export function loadApplicationState(): ApplicationState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(APPLICATION_KEY);
    return raw ? (JSON.parse(raw) as ApplicationState) : null;
  } catch {
    return null;
  }
}

export function saveApplicationState(state: ApplicationState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(APPLICATION_KEY, JSON.stringify(state));
  } catch {
    // See note above.
  }
}

/**
 * Records a lead (name + mobile, saved as soon as they're given, before the
 * estimate is shown) or a "call me back" / "abandoned" event.
 *
 * TODO(backend): this currently only appends to localStorage, so a lead is
 * only visible on the customer's own device/browser. Once a backend exists,
 * replace the body of this function with a POST to it (and, per the spec,
 * trigger a follow-up to the broker or Vela for abandoned leads) — nothing
 * calling `recordLeadEvent` needs to change.
 */
export function recordLeadEvent(event: Record<string, unknown>): void {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(LEADS_KEY);
    const existing: Array<Record<string, unknown>> = raw ? JSON.parse(raw) : [];
    existing.push({ ...event, recordedAt: new Date().toISOString() });
    window.localStorage.setItem(LEADS_KEY, JSON.stringify(existing));
  } catch {
    // Non-fatal — see note above.
  }
}
