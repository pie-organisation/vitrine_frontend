export type SectionBackground = 'none' | 'light' | 'light-grid' | 'dark' | 'dark-grid' | 'gradient'

interface SectionProps {
  children: React.ReactNode
  /** Which background band to render behind this section. Defaults to 'none' (transparent, shows the page background). */
  background?: SectionBackground
  className?: string
  style?: React.CSSProperties
  id?: string
}

const BG_CLASS: Record<SectionBackground, string> = {
  none: '',
  light: 'bg-gradient-light',
  'light-grid': 'bg-gradient-light bg-dot-grid-light',
  dark: 'bg-dark-radial',
  'dark-grid': 'bg-dark-radial bg-dot-grid-dark',
  gradient: 'bg-gradient-fond',
}

/**
 * Full-width band used to wrap a page section. Takes the full width of the screen
 * (it's meant to be a direct child of <main>, which has no max-width of its own) and
 * carries ~1rem of its own padding. Nest a `container-page` div inside for the usual
 * centered, max-width content.
 */
export function Section({ children, background = 'none', className = '', style, id }: SectionProps) {
  return (
    <section id={id} className={`relative w-full p-4 ${BG_CLASS[background]} ${className}`} style={style}>
      {children}
    </section>
  )
}
