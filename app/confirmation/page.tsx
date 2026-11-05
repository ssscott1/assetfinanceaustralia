import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 text-center">
      <div className="w-full max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-3xl text-success">
          ✓
        </div>
        <h1 className="mt-5 text-2xl font-bold text-ink">Application received</h1>
        <p className="mt-2 text-base text-slate">
          Thanks — we&apos;ve got everything you&apos;ve told us. Someone from the team will be in
          touch shortly to confirm the next steps.
        </p>
        <Link href="/" className="mt-8 inline-block text-sm font-medium text-brand">
          Back to home
        </Link>
      </div>
    </main>
  );
}
