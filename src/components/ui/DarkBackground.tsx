interface DarkBackgroundProps {
  /** Whether to show the violet dot overlay on top of the dark radial wash. Defaults to true. */
  grid?: boolean
  /** Whether to show the two soft corner glows. Defaults to true. */
  orbs?: boolean
}

export function DarkBackground({ grid = true, orbs = true }: DarkBackgroundProps) {
  return (
    <>
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <div className="absolute inset-0 bg-dark-radial" />
        {grid && <div className="absolute inset-0 bg-dot-grid-dark" />}
      </div>
      {orbs && (
        <>
          <div
            className="fixed -top-40 -left-40 w-[560px] h-[560px] rounded-full pointer-events-none -z-10"
            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-cubi-violet-mid) 35%, transparent), transparent 70%)' }}
          />
          <div
            className="fixed -bottom-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none -z-10"
            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-cubi-rose) 28.0%, transparent), transparent 70%)' }}
          />
        </>
      )}
    </>
  )
}
