interface BackLinkProps {
  onClick: () => void;
}

export default function BackLink({ onClick }: BackLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 py-2 text-sm font-medium text-slate hover:text-ink"
    >
      <span aria-hidden="true">&larr;</span> Back
    </button>
  );
}
