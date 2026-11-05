/** Marks a prefilled field as the customer's own earlier declaration — not yet verified by anyone. */
export default function DeclaredBadge() {
  return (
    <span className="ml-2 inline-block rounded-full bg-slate/10 px-2 py-0.5 text-xs font-medium text-slate">
      Declared · unverified
    </span>
  );
}
