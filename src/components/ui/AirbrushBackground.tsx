/**
 * Layered on top of DotGridBackground, Home page only.
 * Transparent base so the gradient + dots underneath stay visible —
 * this only adds the strong, colourful airbrush glows.
 */
export function AirbrushBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background:
          'radial-gradient(55% 42% at 82% -6%, color-mix(in srgb, var(--color-cubi-rose) 55.0%, transparent), transparent 62%),' +
          'radial-gradient(48% 40% at 6% 4%, color-mix(in srgb, var(--color-cubi-violet) 50%, transparent), transparent 62%),' +
          'radial-gradient(42% 38% at 50% 105%, color-mix(in srgb, var(--color-cubi-mauve) 40%, transparent), transparent 65%)',
      }}
    />
  )
}
