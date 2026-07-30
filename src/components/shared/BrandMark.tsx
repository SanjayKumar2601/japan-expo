export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 6.5h20M3.5 6.5v2M20.5 6.5v2M5.5 3.8c1.6.5 4 .8 6.5.8s4.9-.3 6.5-.8M6.5 8.5V21M17.5 8.5V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
