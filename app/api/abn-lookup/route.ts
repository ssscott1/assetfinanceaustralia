import { NextRequest, NextResponse } from "next/server";

/**
 * ABN Lookup proxy.
 *
 * Decision: no ABR ABN Lookup GUID is available yet, so this route fails
 * gracefully — it reports the lookup as unavailable rather than erroring,
 * and the client falls back to the two manual questions (trading 2+ years,
 * GST registered) as the build spec describes.
 *
 * Once a GUID exists, set ABN_LOOKUP_GUID in the environment and fill in
 * the fetch below (ABR's free JSON endpoint:
 * https://abr.business.gov.au/json/AbnDetails.aspx?abn=<abn>&guid=<guid>).
 *
 * Note: the ABR ABN Lookup service does not expose GST registration status
 * via the public API — only entity name, ABN status and registration date.
 * This flow always asks the GST question directly for that reason; a
 * successful lookup only prefills business name and derives a "trading 2+
 * years" suggestion from the registration date, both shown to the customer
 * as editable per the spec ("show the derived answer and let the customer
 * correct it").
 */

export interface AbnLookupResult {
  available: boolean;
  businessName?: string;
  registeredOn?: string;
  tradingTwoYearsPlusSuggested?: boolean;
}

export async function GET(request: NextRequest) {
  const abn = request.nextUrl.searchParams.get("abn")?.replace(/\s+/g, "");
  const guid = process.env.ABN_LOOKUP_GUID;

  if (!abn || !/^\d{11}$/.test(abn)) {
    return NextResponse.json<AbnLookupResult>({ available: false }, { status: 400 });
  }

  if (!guid) {
    // No key configured — lookup unavailable, client falls back to manual questions.
    return NextResponse.json<AbnLookupResult>({ available: false });
  }

  try {
    const res = await fetch(
      `https://abr.business.gov.au/json/AbnDetails.aspx?abn=${abn}&guid=${guid}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json<AbnLookupResult>({ available: false });
    }
    const text = await res.text();
    // ABR wraps the JSON in a callback(...) by default for this endpoint.
    const jsonText = text.replace(/^[^(]*\(/, "").replace(/\)\s*$/, "");
    const data = JSON.parse(jsonText);

    const businessName: string | undefined =
      data?.EntityName || data?.BusinessName?.[0] || undefined;
    const registeredOn: string | undefined = data?.AbnStatusEffectiveFrom || undefined;

    let tradingTwoYearsPlusSuggested: boolean | undefined;
    if (registeredOn) {
      const registeredDate = new Date(registeredOn);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      tradingTwoYearsPlusSuggested = registeredDate <= twoYearsAgo;
    }

    return NextResponse.json<AbnLookupResult>({
      available: true,
      businessName,
      registeredOn,
      tradingTwoYearsPlusSuggested,
    });
  } catch {
    return NextResponse.json<AbnLookupResult>({ available: false });
  }
}
