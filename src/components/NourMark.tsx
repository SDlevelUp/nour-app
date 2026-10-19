// Étoile à 8 branches (khatam) : deux carrés superposés, en traits.
export function NourMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="8" y="8" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect
        x="8"
        y="8"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        transform="rotate(45 20 20)"
      />
    </svg>
  );
}
