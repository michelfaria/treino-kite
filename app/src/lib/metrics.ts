import type { Profile, Session, WorkoutTemplate } from '../types'
import { db, nowISO, uid } from '../db'
import { addDays, dayOfWeek, todayISO, weekStart } from './dates'

export const isCounted = (s: Session) => s.status === 'done' || s.status === 'partial'

/** Streak = dias de treino consecutivos SEM pular um dia planejado (folga não quebra). */
export function computeStreak(sessions: Session[]): { current: number; record: number } {
  const byDate = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  let current = 0
  let record = 0
  for (const s of byDate) {
    if (isCounted(s)) {
      current += 1
      record = Math.max(record, current)
    } else if (s.status === 'skipped') {
      current = 0
    }
  }
  return { current, record }
}

export interface WeekBar {
  start: string // segunda-feira
  done: number
  goal: number
}

/** Últimas n semanas (incluindo a atual) de aderência vs. meta. */
export function weeklyAdherence(sessions: Session[], goal: number, n = 12): WeekBar[] {
  const thisWeek = weekStart(todayISO())
  const weeks: WeekBar[] = []
  for (let i = n - 1; i >= 0; i--) {
    const start = addDays(thisWeek, -7 * i)
    const end = addDays(start, 6)
    const done = sessions.filter((s) => isCounted(s) && s.date >= start && s.date <= end).length
    weeks.push({ start, done, goal })
  }
  return weeks
}

/** % de aderência do mês corrente (sessões feitas vs. planejadas pela meta semanal). */
export function monthAdherencePct(sessions: Session[], goal: number): number | null {
  const today = todayISO()
  const monthStart = today.slice(0, 8) + '01'
  const daysElapsed = Number(today.slice(8, 10))
  const expected = Math.max(1, Math.round((goal * daysElapsed) / 7))
  const done = sessions.filter((s) => isCounted(s) && s.date >= monthStart && s.date <= today).length
  if (done === 0 && daysElapsed < 3) return null
  return Math.min(100, Math.round((100 * done) / expected))
}

/** Série de cargas por exercício (nome → [{date, load}]). */
export function loadSeries(sessions: Session[], templates: WorkoutTemplate[]) {
  const nameById = new Map<string, string>()
  for (const t of templates)
    for (const sec of t.sections) for (const e of sec.exercises) if (e.tracksLoad) nameById.set(e.id, e.name)
  const series = new Map<string, { date: string; load: number }[]>()
  for (const s of [...sessions].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const c of s.checks) {
      if (c.load == null || !c.done) continue
      const name = nameById.get(c.exerciseId)
      if (!name) continue
      const arr = series.get(name) ?? []
      arr.push({ date: s.date, load: c.load })
      series.set(name, arr)
    }
  }
  return series
}

/** Média semanal de "como se sentiu" e frequência de painFlag. */
export function wellbeingByWeek(sessions: Session[], n = 8) {
  const thisWeek = weekStart(todayISO())
  const rows: { start: string; feeling: number | null; pain: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const start = addDays(thisWeek, -7 * i)
    const end = addDays(start, 6)
    const inWeek = sessions.filter((s) => s.date >= start && s.date <= end && isCounted(s))
    const feelings = inWeek.map((s) => s.feeling).filter((f): f is 1 | 2 | 3 | 4 | 5 => f != null)
    rows.push({
      start,
      feeling: feelings.length ? feelings.reduce((a, b) => a + b, 0) / feelings.length : null,
      pain: inWeek.filter((s) => s.painFlag).length,
    })
  }
  return rows
}

/**
 * "Não feito é dado, não culpa": ao abrir o app, dias planejados (lembretes)
 * anteriores a hoje sem sessão viram 'skipped'.
 */
export async function backfillSkipped(profile: Profile) {
  const today = todayISO()
  const plannedDows = new Set(profile.reminders.filter((r) => r.enabled).flatMap((r) => r.daysOfWeek))
  if (plannedDows.size === 0) return
  const existing = await db.sessions.where('profileId').equals(profile.id).toArray()
  if (existing.length === 0) return // sem histórico ainda — não retro-marcar antes do 1º uso
  const firstDate = existing.reduce((a, s) => (s.date < a ? s.date : a), today)
  const have = new Set(existing.map((s) => s.date))
  const toAdd = []
  for (let d = firstDate; d < today; d = addDays(d, 1)) {
    if (plannedDows.has(dayOfWeek(d)) && !have.has(d)) {
      toAdd.push({
        id: uid(),
        profileId: profile.id,
        templateId: '',
        templateTitle: 'Dia planejado',
        date: d,
        status: 'skipped' as const,
        checks: [],
        createdAt: nowISO(),
        updatedAt: nowISO(),
      })
    }
  }
  if (toAdd.length) await db.sessions.bulkAdd(toAdd)
}
