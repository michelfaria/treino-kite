/** Datas locais no formato YYYY-MM-DD (fuso do aparelho — America/Sao_Paulo). */

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayISO = () => toISODate(new Date())

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export function dayOfWeek(iso: string): number {
  return new Date(iso + 'T12:00:00').getDay()
}

/** Segunda-feira da semana da data. */
export function weekStart(iso: string): string {
  const dow = dayOfWeek(iso)
  return addDays(iso, dow === 0 ? -6 : 1 - dow)
}

export function formatShort(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export function formatLong(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export const WEEKDAYS_MIN = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
export const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
