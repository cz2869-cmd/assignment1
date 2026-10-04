export function PlantPot({ variant = 0 }: { variant?: number }) {
  const index = ((variant % 4) + 4) % 4

  if (index === 1) {
    return (
      <svg className="plant" viewBox="0 0 80 90" aria-hidden="true">
        <ellipse cx="40" cy="78" rx="18" ry="6" fill="#c4a484" opacity="0.35" />
        <path d="M26 58h28l-4 22H30z" fill="#c4785a" />
        <path d="M26 58h28v4H26z" fill="#a45c42" />
        <path d="M40 58c0-18 14-28 14-28s2 16-6 26" fill="#4a7c59" />
        <path d="M40 58c0-16-14-26-14-26s-2 14 6 24" fill="#5e8f6b" />
        <circle cx="52" cy="28" r="5" fill="#e8a0bf" />
      </svg>
    )
  }

  if (index === 2) {
    return (
      <svg className="plant" viewBox="0 0 80 90" aria-hidden="true">
        <ellipse cx="40" cy="80" rx="16" ry="5" fill="#c4a484" opacity="0.35" />
        <rect x="30" y="58" width="20" height="22" rx="3" fill="#d9a066" />
        <path d="M40 58c-12-2-18-16-12-24 8 2 12 10 12 24z" fill="#3f6f4e" />
        <path d="M40 58c12-2 18-16 12-24-8 2-12 10-12 24z" fill="#4a7c59" />
        <path d="M40 58c0-20 8-28 8-28s4 14 0 28" fill="#6ea07a" />
      </svg>
    )
  }

  if (index === 3) {
    return (
      <svg className="plant" viewBox="0 0 80 90" aria-hidden="true">
        <ellipse cx="40" cy="80" rx="17" ry="5" fill="#c4a484" opacity="0.3" />
        <path d="M28 60h24l-3 20H31z" fill="#8b5e3c" />
        <path d="M40 22c10 8 16 22 12 36-10-4-14-16-12-36z" fill="#4a7c59" />
        <path d="M40 26c-12 8-16 22-12 34 10-2 14-16 12-34z" fill="#6ea07a" />
        <circle cx="28" cy="34" r="4" fill="#e07a5f" />
        <circle cx="54" cy="30" r="3.5" fill="#f2cc8f" />
      </svg>
    )
  }

  return (
    <svg className="plant" viewBox="0 0 80 90" aria-hidden="true">
      <ellipse cx="40" cy="80" rx="18" ry="6" fill="#c4a484" opacity="0.35" />
      <path d="M24 56h32l-5 24H29z" fill="#b08968" />
      <path d="M24 56h32v5H24z" fill="#9c6644" />
      <path d="M40 56c-2-22-18-30-18-30 10 0 18 10 18 30z" fill="#4a7c59" />
      <path d="M40 56c2-22 18-30 18-30-10 0-18 10-18 30z" fill="#5e8f6b" />
      <ellipse cx="22" cy="28" rx="8" ry="12" fill="#3f6f4e" />
      <ellipse cx="58" cy="26" rx="8" ry="12" fill="#6ea07a" />
    </svg>
  )
}
