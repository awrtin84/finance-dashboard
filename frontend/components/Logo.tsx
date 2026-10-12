export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-lg font-black ${className}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="23" height="23" rx="6" stroke="currentColor" strokeWidth="2" />
        <path d="M7 9h12M7 13.5h12M7 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>دفتر</span>
    </span>
  );
}
