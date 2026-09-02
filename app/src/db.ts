import Dexie, { type Table } from 'dexie'
import type { Profile, WorkoutTemplate, Session, BodyMetric } from './types'
import { seedProfiles, seedTemplates } from './data/seed'

export class VentoDB extends Dexie {
  profiles!: Table<Profile, string>
  templates!: Table<WorkoutTemplate, string>
  sessions!: Table<Session, string>
  bodyMetrics!: Table<BodyMetric, string>

  constructor() {
    super('vento-a-favor')
    this.version(1).stores({
      profiles: 'id',
      templates: 'id, profileId',
      sessions: 'id, profileId, date, status, [profileId+date]',
      bodyMetrics: 'id, profileId, date, type, [profileId+type]',
    })
  }
}

export const db = new VentoDB()

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const nowISO = () => new Date().toISOString()

/** Popula perfis e templates na primeira abertura (idempotente). */
export async function ensureSeed() {
  const n = await db.profiles.count()
  if (n === 0) {
    await db.profiles.bulkAdd(seedProfiles())
    await db.templates.bulkAdd(seedTemplates())
    return
  }
  // adiciona templates novos que não existam ainda (ex.: atualização do app)
  const have = new Set(await db.templates.toCollection().primaryKeys())
  const missing = seedTemplates().filter((t) => !have.has(t.id))
  if (missing.length) await db.templates.bulkAdd(missing)
}

export interface BackupFile {
  app: 'vento-a-favor'
  version: 1
  exportedAt: string
  profiles: Profile[]
  templates: WorkoutTemplate[]
  sessions: Session[]
  bodyMetrics: BodyMetric[]
}

export async function exportBackup(): Promise<BackupFile> {
  return {
    app: 'vento-a-favor',
    version: 1,
    exportedAt: nowISO(),
    profiles: await db.profiles.toArray(),
    templates: await db.templates.toArray(),
    sessions: await db.sessions.toArray(),
    bodyMetrics: await db.bodyMetrics.toArray(),
  }
}

export async function importBackup(data: BackupFile) {
  if (data.app !== 'vento-a-favor') throw new Error('Arquivo não é um backup do Vento a Favor.')
  await db.transaction('rw', [db.profiles, db.templates, db.sessions, db.bodyMetrics], async () => {
    await db.profiles.bulkPut(data.profiles ?? [])
    await db.templates.bulkPut(data.templates ?? [])
    await db.sessions.bulkPut(data.sessions ?? [])
    await db.bodyMetrics.bulkPut(data.bodyMetrics ?? [])
  })
}
