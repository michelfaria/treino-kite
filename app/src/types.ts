export type ProfileId = 'michel' | 'gabriella'
export type ThemeId = 'ocean' | 'rose'

export interface Reminder {
  id: string
  daysOfWeek: number[] // 0=dom … 6=sáb
  time: string // 'HH:mm'
  enabled: boolean
}

export interface Profile {
  id: ProfileId
  name: string
  theme: ThemeId
  weeklyGoal: number
  reminders: Reminder[]
  aiOptIn: boolean
  createdAt: string
  updatedAt: string
}

export type MetricType = 'reps' | 'time' | 'none'

export interface Exercise {
  id: string
  name: string
  dose: string
  note?: string
  kite?: string // transferência para o kite (só Michel)
  videoId?: string // id do YouTube
  videoBy?: string // canal
  metricType: MetricType
  tracksLoad: boolean
}

export interface Section {
  title: string
  note?: string
  exercises: Exercise[]
}

export interface WorkoutTemplate {
  id: string
  profileId: ProfileId
  title: string
  subtitle: string
  durationMin: number
  sections: Section[]
  createdAt: string
  updatedAt: string
}

export type SessionStatus = 'done' | 'partial' | 'skipped' | 'planned'
export type SessionContext = 'casa' | 'academia' | 'ar-livre' | 'kite'

export interface SessionCheck {
  exerciseId: string
  done: boolean
  load?: number
  note?: string
}

export interface Session {
  id: string
  profileId: ProfileId
  templateId: string
  templateTitle: string // snapshot: título na hora do treino
  snapshot?: Section[] // snapshot do treino executado (histórico imune a edições)
  date: string // YYYY-MM-DD local
  status: SessionStatus
  startedAt?: string
  finishedAt?: string
  checks: SessionCheck[]
  feeling?: 1 | 2 | 3 | 4 | 5
  painFlag?: boolean
  context?: SessionContext
  createdAt: string
  updatedAt: string
}

export type BodyMetricType = 'weight' | 'waist' | 'hip' | 'chest' | 'arm' | 'thigh'

export interface BodyMetric {
  id: string
  profileId: ProfileId
  date: string
  type: BodyMetricType
  value: number
  createdAt: string
  updatedAt: string
}
