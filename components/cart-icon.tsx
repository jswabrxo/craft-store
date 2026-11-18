export function CartIcon({ className }: { className: string }) {
  return <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <path d="M2 4h4l4 18h16l4-14H7" fill="var(--theme-surface, white)" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    <path d="m18 10 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" fill="currentColor" />
    <circle cx="12" cy="27" r="2" fill="currentColor" />
    <circle cx="24" cy="27" r="2" fill="currentColor" />
  </svg>;
}
