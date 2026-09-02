import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, nowISO, uid } from '../db'
import { Card, Sparkline } from '../components/ui'
import { computeStreak, loadSeries, monthAdherencePct, weeklyAdherence, wellbeingByWeek, isCounted } from '../lib/metrics'
import { addDays, formatShort, todayISO, weekStart, WEEKDAYS_MIN } from '../lib/dates'
import type { BodyMetricType, Profile } from '../types'

export function Progress({ profile, onHistory }: { profile: Profile; onHistory: () => void }) {
  const sessions = useLiveQuery(() => db.sessions.where('profileId').equals(profile.id).toArray(), [profile.id]) ?? []
  const templates = useLiveQuery(() => db.templates.where('profileId').equals(profile.id).toArray(), [profile.id]) ?? []
  const body = useLiveQuery(() => db.bodyMetrics.where('profileId').equals(profile.id).toArray(), [profile.id]) ?? []

  const weeks = weeklyAdherence(sessions, profile.weeklyGoal)
  const monthPct = monthAdherencePct(sessions, profile.weeklyGoal)
  const { current, record } = computeStreak(sessions)
  const loads = useMemo(() => loadSeries(sessions, templates), [sessions, templates])
  const loadNames = [...loads.keys()]
  const [loadSel, setLoadSel] = useState<string | null>(null)
  const selName = loadSel && loadNames.includes(loadSel) ? loadSel : loadNames[0]
  const selSeries = selName ? loads.get(selName)! : []
  const wellbeing = wellbeingByWeek(sessions)
  const anyCounted = sessions.some(isCounted)

  return (
    <div className="screen">
      <div className="row">
        <div>
          <p className="eyebrow">Evolução</p>
          <h1 className="big" style={{ marginTop: 4 }}>Sua maré</h1>
        </div>
        <button className="chip" onClick={onHistory}>📅 Histórico</button>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        {/* 1 · aderência */}
        <Card>
          <h2 className="eyebrow">Aderência semanal</h2>
          {anyCounted ? (
            <>
              <div className="metric-big num" style={{ marginTop: 10 }}>
                {monthPct != null ? `${monthPct}%` : '—'}
              </div>
              <p className="metric-sub">do ritmo da sua meta neste mês · meta: {profile.weeklyGoal}×/semana</p>
              <div className="bars" role="img" aria-label={`Últimas 12 semanas: esta semana ${weeks[weeks.length - 1].done} de ${weeks[weeks.length - 1].goal} sessões; melhor semana ${Math.max(...weeks.map((w) => w.done))}`}>
                {weeks.map((w) => {
                  const h = Math.min(1, w.done / Math.max(1, w.goal))
                  return (
                    <div className={`bar${w.done >= w.goal ? ' hit' : ''}`} key={w.start} title={`${formatShort(w.start)}: ${w.done}/${w.goal}`}>
                      <i style={{ height: `${Math.max(4, h * 100)}%` }} />
                    </div>
                  )
                })}
              </div>
              <div className="row" style={{ marginTop: 6 }}>
                <span style={{ color: 'var(--faint)', fontSize: '0.7rem' }}>{formatShort(weeks[0].start)}</span>
                <span style={{ color: 'var(--faint)', fontSize: '0.7rem' }}>esta semana</span>
              </div>
            </>
          ) : (
            <p className="empty">
              <b>Registre seu primeiro treino</b> para ver a barra da semana subir.
            </p>
          )}
        </Card>

        {/* 2 · streak */}
        <Card>
          <h2 className="eyebrow">Sequência</h2>
          <div className="row" style={{ alignItems: 'baseline', marginTop: 10 }}>
            <div className="metric-big num">{current > 0 ? `🔥 ${current}` : '—'}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              recorde: <b className="num">{record}</b>
            </div>
          </div>
          <p className="metric-sub">treinos seguidos sem pular dia planejado</p>
          <MicroCal sessions={sessions} />
        </Card>

        {/* 3 · cargas */}
        <Card>
          <h2 className="eyebrow">Cargas</h2>
          {loadNames.length === 0 ? (
            <p className="empty">
              <b>Anote a carga (kg)</b> nos exercícios do player para acompanhar sua força subindo.
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0 4px' }}>
                {loadNames.map((n) => (
                  <button key={n} aria-label={n} className={`chip${n === selName ? ' on' : ''}`} onClick={() => setLoadSel(n)}>
                    {n.length > 26 ? n.slice(0, 24) + '…' : n}
                  </button>
                ))}
              </div>
              <div className="row" style={{ alignItems: 'baseline', marginTop: 8 }}>
                <div className="metric-big num" style={{ fontSize: '2rem' }}>
                  {selSeries.length ? `${selSeries[selSeries.length - 1].load} kg` : '—'}
                </div>
                {selSeries.length > 1 && (
                  <Delta first={selSeries[0].load} last={selSeries[selSeries.length - 1].load} />
                )}
              </div>
              <Sparkline values={selSeries.map((p) => p.load)} />
            </>
          )}
        </Card>

        {/* 4 · corpo */}
        <BodyCard profileId={profile.id} body={body} />

        {/* 5 · bem-estar */}
        <Card>
          <h2 className="eyebrow">Bem-estar</h2>
          {wellbeing.every((w) => w.feeling == null) ? (
            <p className="empty">
              Ao finalizar um treino, conte <b>como se sentiu</b> — a média das semanas aparece aqui.
            </p>
          ) : (
            <>
              <div className="bars" style={{ height: 56 }} role="img" aria-label={`Média de como se sentiu por semana; esta semana: ${wellbeing[wellbeing.length - 1].feeling?.toFixed(1) ?? "sem registro"}`}>
                {wellbeing.map((w) => (
                  <div className="bar" key={w.start} title={`${formatShort(w.start)}: ${w.feeling?.toFixed(1) ?? '—'}`}>
                    <i style={{ height: w.feeling ? `${(w.feeling / 5) * 100}%` : '0%' }} />
                  </div>
                ))}
              </div>
              <p className="metric-sub">média de “como se sentiu” · últimas 8 semanas</p>
            </>
          )}
          {profile.id === 'michel' && (
            <>
              <hr className="hr" />
              <h2 className="eyebrow">Virilha (painFlag)</h2>
              {sessions.some((s) => s.painFlag != null) ? (
                <>
                  <div className="bars" style={{ height: 40 }} role="img" aria-label={`Sessões com dor na virilha por semana; esta semana: ${wellbeing[wellbeing.length - 1].pain}`}>
                    {wellbeing.map((w) => (
                      <div className="bar" key={w.start} title={`${formatShort(w.start)}: ${w.pain} com dor`}>
                        <i style={{ height: `${Math.min(1, w.pain / 3) * 100}%`, background: w.pain ? 'var(--danger)' : 'transparent' }} />
                      </div>
                    ))}
                  </div>
                  <p className="metric-sub">
                    sessões com “senti a virilha” por semana — tendência caindo = plano funcionando.
                    {wellbeing[wellbeing.length - 1].pain >= 2 && (
                      <b style={{ color: 'var(--danger)', display: 'block', marginTop: 6 }}>
                        2+ registros nesta semana: vale procurar um fisioterapeuta do esporte.
                      </b>
                    )}
                  </p>
                </>
              ) : (
                <p className="empty">O gráfico mais importante do app para você: a frequência da dor na virilha, semana a semana.</p>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

function Delta({ first, last }: { first: number; last: number }) {
  const d = first ? Math.round(((last - first) / first) * 100) : 0
  return (
    <span style={{ color: d >= 0 ? 'var(--ok)' : 'var(--muted)', fontWeight: 700, fontSize: '0.9rem' }} className="num">
      {d >= 0 ? '▲' : '▼'} {Math.abs(d)}% desde o início
    </span>
  )
}

function MicroCal({ sessions }: { sessions: { date: string; status: string }[] }) {
  const start = addDays(weekStart(todayISO()), -21)
  const today = todayISO()
  const byDate = new Map(sessions.map((s) => [s.date, s.status]))
  const days: string[] = []
  for (let i = 0; i < 28; i++) days.push(addDays(start, i))
  return (
    <div>
      <div className="dotcal" style={{ marginTop: 14 }} aria-hidden>
        {WEEKDAYS_MIN.slice(1).concat(WEEKDAYS_MIN[0]).map((w, i) => (
          <span key={i} style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--faint)' }}>{w}</span>
        ))}
      </div>
      <div className="dotcal" role="img" aria-label="Últimas 4 semanas de treino">
        {days.map((d) => {
          const st = byDate.get(d)
          const cls =
            st === 'done' ? 'done' : st === 'partial' ? 'partial' : st === 'skipped' ? 'skipped' : ''
          return <span key={d} className={`d ${cls}${d === today ? ' today' : ''}`}>{Number(d.slice(8, 10))}</span>
        })}
      </div>
    </div>
  )
}

const BODY_TYPES: { v: BodyMetricType; label: string; unit: string }[] = [
  { v: 'weight', label: 'Peso', unit: 'kg' },
  { v: 'waist', label: 'Cintura', unit: 'cm' },
  { v: 'hip', label: 'Quadril', unit: 'cm' },
  { v: 'chest', label: 'Peito', unit: 'cm' },
  { v: 'arm', label: 'Braço', unit: 'cm' },
  { v: 'thigh', label: 'Coxa', unit: 'cm' },
]

function BodyCard({ profileId, body }: { profileId: string; body: { id: string; date: string; type: string; value: number }[] }) {
  const [type, setType] = useState<BodyMetricType>('weight')
  const [val, setVal] = useState('')
  const meta = BODY_TYPES.find((b) => b.v === type)!
  const series = body
    .filter((b) => b.type === type)
    .sort((a, b) => a.date.localeCompare(b.date))

  const add = async () => {
    const v = Number(val.replace(',', '.'))
    if (!v || v <= 0) return
    await db.bodyMetrics.add({
      id: uid(),
      profileId: profileId as 'michel' | 'gabriella',
      date: todayISO(),
      type,
      value: v,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    })
    setVal('')
  }

  return (
    <Card>
      <h2 className="eyebrow">Corpo</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
        {BODY_TYPES.map((b) => (
          <button key={b.v} className={`chip${b.v === type ? ' on' : ''}`} onClick={() => setType(b.v)}>
            {b.label}
          </button>
        ))}
      </div>
      {series.length === 0 ? (
        <p className="empty">
          Registre seu primeiro <b>{meta.label.toLowerCase()}</b> para ver a curva. Sem julgamento — só dado.
        </p>
      ) : (
        <>
          <div className="row" style={{ alignItems: 'baseline' }}>
            <div className="metric-big num" style={{ fontSize: '2rem' }}>
              {series[series.length - 1].value} {meta.unit}
            </div>
            <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{formatShort(series[series.length - 1].date)}</span>
          </div>
          <Sparkline values={series.map((s) => s.value)} />
        </>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          className="text"
          style={{ flex: 1 }}
          inputMode="decimal"
          placeholder={`${meta.label} de hoje (${meta.unit})`}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          aria-label={`${meta.label} de hoje em ${meta.unit}`}
        />
        <button className="btn" onClick={add}>Registrar</button>
      </div>
    </Card>
  )
}
