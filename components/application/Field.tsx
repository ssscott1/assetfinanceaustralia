import DeclaredBadge from "./DeclaredBadge";

interface FieldProps {
  label: string;
  /** True when this field's value was carried in from the quick quote. */
  declared?: boolean;
  children: React.ReactNode;
}

export default function Field({ label, declared, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center text-sm text-slate">
        {label}
        {declared && <DeclaredBadge />}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-tap w-full rounded-xl border border-slate/25 bg-white px-4 text-base text-ink outline-none focus:border-brand";
