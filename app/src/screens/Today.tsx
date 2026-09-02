import { useLiveQuery } from 'dexie-react-hooks'
import { db, nowISO, uid } from '../db'
import { quoteOfTheDay } from '../data/quotes'
import { computeStreak, isCounted } from '../lib/metrics'
import { dayOfWeek, formatLong, todayISO } from '../lib/dates'
import { Card, Waterline } from '../components/ui'
import type { Profile, Session, WorkoutTemplate } from '../types'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Boa madrugada'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function Today({
  profile,
  onStart,
  onResume,
}: {
  profile: Profile
  onStart: (t: WorkoutTemplate) => void
  onResume: (s: Session) => void
}) {
  const today = todayISO()
  const templates = useLiveQuery(() => db.templates.where('profileId').equals(profile.id).toArray(), [profile.id]) ?? []
  const sessions = useLiveQuery(() => db.sessions.where('profileId').equals(profile.id).toArray(), [profile.id]) ?? []

  const active = sessions.find((s) => s.status === 'planned' && s.startedAt)
  const doneToday = sessions.find((s) => s.date === today && isCounted(s))
  const { current: streak } = computeStreak(sessions)
  const isPlannedDay = profile.reminders.some((r) => r.enabled && r.daysOfWeek.includes(dayOfWeek(today)))

  // rotação: próximo template depois do último treinado
  const counted = sessions.filter(isCounted).sort((a, b) => (a.startedAt ?? a.date).localeCompare(b.startedAt ?? b.date))
  const lastTplId = counted.length ? counted[counted.length - 1].templateId : null
  const order = templates
  const lastIdx = order.findIndex((t) => t.id === lastTplId)
  const suggested = order.length ? order[(lastIdx + 1) % order.length] : undefined
  // se o treino de hoje já foi feito (ou há um em andamento), o card de sugestão some — mostra todos
  const others = doneToday || active ? order : order.filter((t) => t.id !== suggested?.id)

  return (
    <div className="screen">
      <p className="eyebrow">{formatLong(today)}</p>
      <div className="row" style={{ alignItems: 'flex-start', marginTop: 4 }}>
        <h1 className="big">
          {greeting()}, {profile.name}
        </h1>
        {streak > 0 && (
          <span className="chip" title="Sequência de treinos" aria-label={`Sequência de ${streak} treinos`}>
            🔥 <b className="num">{streak}</b>
          </span>
        )}
      </div>
      <div style={{ width: 88, margin: '10px 0 14px' }}>
        <Waterline />
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 20 }}>
        “{quoteOfTheDay(profile.id, today)}”
      </p>

      {active && (
        <Card style={{ marginBottom: 14, borderColor: 'var(--accent)' }}>
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>Treino em andamento</p>
          <div className="row" style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
              {active.templateTitle}
            </div>
            <button className="btn primary" onClick={() => onResume(active)}>
              Continuar
            </button>
          </div>
        </Card>
      )}

      {doneToday && !active && (
        <Card style={{ marginBottom: 14 }}>
          <div className="row">
            <div>
              <p className="eyebrow" style={{ color: 'var(--ok)' }}>Feito ✓</p>
              <div style={{ fontWeight: 800, marginTop: 6 }}>{doneToday.templateTitle}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.84rem', marginTop: 3 }}>
                Treino de hoje registrado. Descanso também é treino.
              </div>
            </div>
          </div>
        </Card>
      )}

      {suggested && !active && !doneToday && (
        <Card style={{ marginBottom: 14 }}>
          <p className="eyebrow">{isPlannedDay ? 'Treino de hoje' : 'Sugestão de treino'}</p>
          <div style={{ margin: '10px 0 4px', fontWeight: 800, fontSize: '1.25rem' }}>
            {suggested.title} · <span style={{ color: 'var(--accent-2)' }}>{suggested.subtitle}</span>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            ⏱ {suggested.durationMin} min · {suggested.sections.reduce((n, s) => n + s.exercises.length, 0)} exercícios
          </div>
          <button className="btn primary full" onClick={() => onStart(suggested)}>
            Começar treino
          </button>
        </Card>
      )}

      {others.length > 0 && (
        <>
          <p className="eyebrow" style={{ margin: '22px 0 10px' }}>Outros treinos</p>
          <div className="stack">
            {others.map((t) => (
              <button key={t.id} className="card row" style={{ textAlign: 'left', width: '100%', padding: 14 }} onClick={() => onStart(t)}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {t.title} — {t.subtitle}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 2 }}>⏱ {t.durationMin} min</div>
                </div>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>›</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Cria a sessão no banco e devolve — chamado pelo App ao iniciar treino. */
export async function startSession(profile: Profile, t: WorkoutTemplate): Promise<Session> {
  const s: Session = {
    id: uid(),
    profileId: profile.id,
    templateId: t.id,
    templateTitle: `${t.title} — ${t.subtitle}`,
    snapshot: t.sections,
    date: todayISO(),
    status: 'planned',
    startedAt: nowISO(),
    checks: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  await db.sessions.add(s)
  return s
}
