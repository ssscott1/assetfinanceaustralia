interface ChoiceButtonProps {
  label: string;
  sublabel?: string;
  onClick: () => void;
  selected?: boolean;
}

/** Big, full-width tap target (min 56px tall) — the only answer control on a question screen. */
export default function ChoiceButton({ label, sublabel, onClick, selected }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-tap w-full rounded-xl border px-5 py-4 text-left text-lg font-semibold transition-colors ${
        selected
          ? "border-brand bg-brand/5 text-brand"
          : "border-slate/20 bg-white text-ink hover:border-brand hover:bg-brand/5"
      }`}
    >
      {label}
      {sublabel && <span className="mt-0.5 block text-sm font-normal text-slate">{sublabel}</span>}
    </button>
  );
}
