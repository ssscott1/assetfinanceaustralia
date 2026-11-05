import Link from "next/link";

/**
 * Minimal landing page — just enough to carry the primary CTA into the quote
 * flow. The build spec says this flow should feel like part of
 * assetfinanceaustralia.com.au; in practice that likely means embedding
 * `/quote` into the real site's existing front page rather than using this
 * one. This page exists so the flow is runnable and demoable on its own.
 */
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12 text-center">
        <h1 className="text-3xl font-bold leading-tight text-ink">
          Asset finance, estimated in under a minute
        </h1>
        <p className="mt-3 text-base text-slate">
          A few quick questions, an indicative rate, and real repayment estimates. No credit check,
          no obligation.
        </p>
        <Link
          href="/quote"
          className="mt-8 inline-flex min-h-tap w-full items-center justify-center rounded-xl bg-brand text-lg font-semibold text-white"
        >
          Get my estimate
        </Link>
        <p className="mt-4 text-xs text-slate">Takes about 60 seconds.</p>
      </div>
    </main>
  );
}
