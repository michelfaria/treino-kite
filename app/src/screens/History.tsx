import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Card } from '../components/ui'
import { todayISO, WEEKDAYS_MIN } from '../lib/dates'
import type { Profile, Session } from '../types'

const STATUS_LABEL: Record<string, string> = {
  done: 'Feito',
  partial: 'Parcial',
  skipped: 'Pulado',
  planned: 'Em andamento',
}

export function History({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  const today = todayISO()
  const [ym, setYm] = useState(today.slice(0, 7)) // YYYY-MM
  const [detail, setDetail] = useState<Session | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (detail && !d.open) d.showModal()
    if (!detail && d.open) d.close()
  }, [detail])
  const sessions =
    useLiveQuery(() => db.sessions.where('profileId').equals(profile.id).toArray(), [profile.id]) ?? []

  const [y, m] = [Number(ym.slice(0, 4)), Number(ym.slice(5, 7))]
  const first = new Date(y, m - 1, 1)
  const daysInMonth = new Date(y, m, 0).getDate()
  const lead = (first.getDay() + 6) % 7 // semana começa na segunda
  const byDate = new Map<string, Session>()
  for (const s of sessions) if (s.date.startsWith(ym)) byDate.set(s.date, s)

  const monthLabel = first.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const shift = (n: number) => {
    const d = new Date(y, m - 1 + n, 1)
    setYm(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const list = sessions
    .filter((s) => s.date.startsWith(ym) && s.status !== 'planned')
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="screen">
      <button className="btn ghost" style={{ minHeight: 40, paddingLeft: 0, marginBottom: 8 }} onClick={onBack}>
        ‹ Evolução
      </button>
      <p className="eyebrow">Histórico</p>
      <div className="row" style={{ marginTop: 4, marginBottom: 16 }}>
        <h1 className="big" style={{ fontSize: '1.35rem', textTransform: 'capitalize' }}>{monthLabel}</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="chip" aria-label="Mês anterior" onClick={() => shift(-1)}>‹</button>
          <button className="chip" aria-label="Próximo mês" onClick={() => shift(1)}>›</button>
        </div>
      </div>

      <Card>
        <div className="dotcal" aria-hidden style={{ marginTop: 0 }}>
          {WEEKDAYS_MIN.slice(1).concat(WEEKDAYS_MIN[0]).map((w, i) => (
            <span key={i} style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--faint)' }}>{w}</span>
          ))}
        </div>
        <div className="dotcal">
          {Array.from({ length: lead }).map((_, i) => (
            <span key={`l${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = `${ym}-${String(i + 1).padStart(2, '0')}`
            const s = byDate.get(date)
            if (!s || s.status === 'planned') {
              return (
                <span key={date} className={`d${date === today ? ' today' : ''}`} aria-hidden>
                  {i + 1}
                </span>
              )
            }
            return (
              <button
                key={date}
                className={`d ${s.status}${date === today ? ' today' : ''}`}
                style={{ border: 'none', cursor: 'pointer' }}
                aria-label={`Dia ${i + 1}: ${STATUS_LABEL[s.status]}, ver detalhes`}
                onClick={() => setDetail(s)}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 16, fontSize: '0.72rem', color: 'var(--muted)' }}>
          <span><i style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 5, background: 'var(--accent)' }} /> feito</span>
          <span><i style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 5, background: 'color-mix(in srgb, var(--accent) 40%, var(--chip))' }} /> parcial</span>
          <span><i style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 5, background: 'var(--chip)', border: '1px solid var(--line)' }} /> pulado</span>
        </div>
      </Card>

      <div className="stack" style={{ marginTop: 14 }}>
        {list.length === 0 && <p className="empty">Nenhuma sessão registrada neste mês.</p>}
        {list.map((s) => (
          <button key={s.id} className="card row" style={{ textAlign: 'left', width: '100%', padding: 14 }} onClick={() => setDetail(s)}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{s.templateTitle}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 2 }}>
                {new Date(s.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' · '}
                {STATUS_LABEL[s.status]}
                {s.feeling ? ` · ${['😮‍💨', '😕', '🙂', '😄', '🤩'][s.feeling - 1]}` : ''}
                {s.painFlag ? ' · virilha ⚠️' : ''}
              </div>
            </div>
            <span style={{ color: 'var(--accent)' }}>›</span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="sheet"
        aria-label="Detalhe da sessão"
        onClose={() => setDetail(null)}
        onClick={(e) => e.target === dialogRef.current && setDetail(null)}
      >
        {detail && (
          <div style={{ maxHeight: '75dvh', overflowY: 'auto', padding: 22 }}>
            <div style={{ width: 64, margin: '0 auto 16px' }}><hr className="waterline" /></div>
            <p className="eyebrow">{STATUS_LABEL[detail.status]}</p>
            <h2 style={{ fontSize: '1.1rem', margin: '6px 0 2px' }}>{detail.templateTitle}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 14 }}>
              {new Date(detail.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {(detail.snapshot ?? []).map((sec) => {
              const checks = new Map(detail.checks.map((c) => [c.exerciseId, c]))
              return (
                <div key={sec.title} style={{ marginBottom: 10 }}>
                  <p className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 4 }}>{sec.title}</p>
                  {sec.exercises.map((e) => {
                    const c = checks.get(e.id)
                    return (
                      <div key={e.id} className="row" style={{ padding: '5px 0', borderBottom: '1px solid var(--line)' }}>
                        <span style={{ fontSize: '0.85rem', opacity: c?.done ? 1 : 0.45 }}>
                          {c?.done ? '✓' : '·'} {e.name}
                        </span>
                        {c?.load != null && <span className="num" style={{ color: 'var(--accent-2)', fontSize: '0.82rem', fontWeight: 700 }}>{c.load} kg</span>}
                      </div>
                    )
                  })}
                </div>
              )
            })}
            <button className="btn full" style={{ marginTop: 12 }} onClick={() => setDetail(null)}>Fechar</button>
          </div>
        )}
      </dialog>
    </div>
  )
}
