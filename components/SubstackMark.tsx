// Substack's mark: a bookmark under two bars.
export default function SubstackMark({ className = "hl-sub" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <path d="M3 2.5h10v1.6H3zM3 5.6h10v1.6H3zM3 8.7h10V14l-5-2.8L3 14z" />
    </svg>
  );
}
