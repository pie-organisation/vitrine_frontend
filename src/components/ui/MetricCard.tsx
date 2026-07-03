interface MetricCardProps {
  label: string
  value: string | number
  sublabel?: string
}

export function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.82)',
        border: '1px solid rgba(107,79,224,0.1)',
        boxShadow: '0 4px 20px rgba(107,79,224,0.07)',
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-widest mb-3"
        style={{ color: 'rgba(107,79,224,0.5)' }}
      >
        {label}
      </div>
      <div
        className="font-display font-extrabold text-3xl leading-none"
        style={{
          background: 'linear-gradient(135deg, #6B4FE0 0%, #C084FC 55%, #E879F9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-1px',
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div className="text-xs mt-1.5" style={{ color: 'rgba(30,15,70,0.4)' }}>
          {sublabel}
        </div>
      )}
    </div>
  )
}
