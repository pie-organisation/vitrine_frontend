import logoSrc from '../../assets/logo_cubi.png'

interface LogoProps {
  size?: 'sm' | 'md'
}

export function Logo({ size = 'md' }: LogoProps) {
  const h    = size === 'sm' ? '32px' : '36px'
  const word = size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <div className="flex items-end gap-2.5">
      <img
        src={logoSrc}
        alt="CUBI"
        style={{ height: h, width: 'auto', objectFit: 'contain', display: 'block' }}
      />
      <span
        className={`font-display font-extrabold ${word} leading-none`}
        style={{
          background: 'linear-gradient(135deg, #6B4FE0 0%, #C084FC 55%, #E879F9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        CUBI
      </span>
    </div>
  )
}
