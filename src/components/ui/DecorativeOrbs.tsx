export function DecorativeOrbs() {
  return (
    <>
      <div
        className="fixed -top-48 -left-48 w-[500px] h-[500px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(107,79,224,.13), transparent 70%)' }}
      />
      <div
        className="fixed -bottom-36 -right-36 w-[420px] h-[420px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(232,121,249,.13), transparent 70%)' }}
      />
    </>
  )
}
