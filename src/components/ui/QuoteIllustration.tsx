interface QuoteIllustrationProps {
  className?: string
}

export function QuoteIllustration({ className = '' }: QuoteIllustrationProps) {
  return (
    <svg viewBox="0 0 220 150" className={className} role="img" aria-label="Illustration d'un devis validé">
      <defs>
        <linearGradient id="quote-badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-cubi-violet)" />
          <stop offset="55%" stopColor="var(--color-cubi-mauve)" />
          <stop offset="100%" stopColor="var(--color-cubi-rose)" />
        </linearGradient>
      </defs>

      {/* Decorative dots */}
      <circle cx="34" cy="18" r="3" fill="var(--color-cubi-mauve)" opacity="0.5" />
      <circle cx="20" cy="34" r="2" fill="var(--color-cubi-rose)" opacity="0.5" />
      <circle cx="188" cy="30" r="2.5" fill="var(--color-cubi-violet)" opacity="0.4" />

      {/* Document */}
      <g>
        <path
          d="M46 20 H128 L150 42 V126 A8 8 0 0 1 142 134 H46 A8 8 0 0 1 38 126 V28 A8 8 0 0 1 46 20 Z"
          fill="#ffffff"
          stroke="color-mix(in srgb, var(--color-cubi-violet) 18%, transparent)"
          strokeWidth="1.5"
        />
        {/* Folded corner */}
        <path
          d="M128 20 L150 42 H134 A6 6 0 0 1 128 36 Z"
          fill="color-mix(in srgb, var(--color-cubi-violet) 10%, transparent)"
        />

        {/* Text lines */}
        <rect x="54" y="56" width="60" height="6" rx="3" fill="color-mix(in srgb, var(--color-cubi-ink) 18%, transparent)" />
        <rect x="54" y="70" width="80" height="6" rx="3" fill="color-mix(in srgb, var(--color-cubi-ink) 12%, transparent)" />
        <rect x="54" y="84" width="70" height="6" rx="3" fill="color-mix(in srgb, var(--color-cubi-ink) 12%, transparent)" />
        <rect x="54" y="98" width="48" height="6" rx="3" fill="color-mix(in srgb, var(--color-cubi-ink) 12%, transparent)" />

        {/* Amount line, slightly emphasised */}
        <rect x="54" y="114" width="36" height="8" rx="4" fill="color-mix(in srgb, var(--color-cubi-violet) 20%, transparent)" />
      </g>

      {/* Validated quote badge */}
      <circle cx="156" cy="118" r="26" fill="url(#quote-badge-grad)" />
      <path
        d="M145 118 L153 126 L169 108"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
