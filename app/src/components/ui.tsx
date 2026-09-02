import { useId, type ReactNode } from 'react'

export const Icons = {
  today: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ico" aria-hidden>
      <circle cx="12" cy="10" r="4" />
      <path d="M2 19c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0" />
      <path d="M12 2v1.5M5.6 4.6l1 1M18.4 4.6l-1 1" />
    </svg>
  ),
  workouts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ico" aria-hidden>
      <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ico" aria-hidden>
      <path d="M3 20h18" />
      <path d="M5 16l4-5 4 3 6-8" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ico" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  ),
}

export function Waterline({ thin = false }: { thin?: boolean }) {
  return <hr className={thin ? 'waterline thin' : 'waterline'} aria-hidden />
}

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="card" style={style}>
      {children}
    </div>
  )
}

/** Sparkline SVG minimalista — 1 série, sem eixos pesados. */
export function Sparkline({
  values,
  width = 280,
  height = 56,
}: {
  values: number[]
  width?: number
  height?: number
}) {
  const gradId = useId()
  if (values.length === 0) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pad = 6
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0
  const pts = values.map((v, i) => {
    const x = pad + i * step
    const y = height - pad - ((v - min) / span) * (height - pad * 2)
    return [x, y] as const
  })
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Série de ${values.length} pontos, de ${min} a ${max}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--brand-1)" />
          <stop offset="0.5" stopColor="var(--brand-2)" />
          <stop offset="1" stopColor="var(--brand-3)" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={`url(#${gradId})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.length === 1 ? (
        <circle cx={pts[0][0]} cy={pts[0][1]} r="4" fill="var(--brand-2)" />
      ) : (
        <circle cx={last[0]} cy={last[1]} r="4" fill="var(--brand-3)" />
      )}
    </svg>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)} />
  )
}
