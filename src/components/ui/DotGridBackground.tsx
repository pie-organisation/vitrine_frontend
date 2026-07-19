interface DotGridBackgroundProps {
  grid?: boolean;
}

export function DotGridBackground({grid = false}: DotGridBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #F8F4FF 0%, #FDF0FF 40%, #F4EEFF 100%)',
        }}
      />

      {grid && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(107,79,224,.25) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
      )}
    </div>
  );
}