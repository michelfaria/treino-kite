import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, nowISO } from '../db'
import { Card } from '../components/ui'
import type { Profile, WorkoutTemplate } from '../types'

export function Workouts({ profile, onStart }: { profile: Profile; onStart: (t: WorkoutTemplate) => void }) {
  const templates = useLiveQuery(() => db.templates.where('profileId').equals(profile.id).toArray(), [profile.id]) ?? []
  const [openId, setOpenId] = useState<string | null>(null)
  const open = templates.find((t) => t.id === openId)

  if (open) return <WorkoutDetail t={open} onBack={() => setOpenId(null)} onStart={onStart} />

  return (
    <div className="screen">
      <p className="eyebrow">Biblioteca</p>
      <h1 className="big" style={{ marginTop: 4, marginBottom: 18 }}>Treinos</h1>
      <div className="stack">
        {templates.map((t) => (
          <button key={t.id} className="card" style={{ textAlign: 'left', width: '100%' }} onClick={() => setOpenId(t.id)}>
            <div className="row">
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  {t.title} — <span style={{ color: 'var(--accent-2)' }}>{t.subtitle}</span>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 4 }}>
                  ⏱ {t.durationMin} min · {t.sections.reduce((n, s) => n + s.exercises.length, 0)} exercícios ·{' '}
                  {t.sections.length} blocos
                </div>
              </div>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.2rem' }}>›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function WorkoutDetail({ t, onBack, onStart }: { t: WorkoutTemplate; onBack: () => void; onStart: (t: WorkoutTemplate) => void }) {
  const [editing, setEditing] = useState(false)

  const saveDose = async (exerciseId: string, dose: string) => {
    const next = structuredClone(t)
    for (const sec of next.sections)
      for (const e of sec.exercises) if (e.id === exerciseId) e.dose = dose
    next.updatedAt = nowISO()
    await db.templates.put(next)
  }

  return (
    <div className="screen">
      <div className="row" style={{ marginBottom: 10 }}>
        <button className="btn ghost" style={{ minHeight: 40, paddingLeft: 0 }} onClick={onBack}>
          ‹ Treinos
        </button>
        <button className={`chip${editing ? ' on' : ''}`} onClick={() => setEditing(!editing)}>
          {editing ? 'Concluir edição' : '✎ Editar doses'}
        </button>
      </div>
      <h1 className="big" style={{ fontSize: '1.35rem' }}>
        {t.title} — <span style={{ color: 'var(--accent-2)' }}>{t.subtitle}</span>
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '6px 0 16px' }}>⏱ {t.durationMin} min</p>
      <div className="stack">
        {t.sections.map((sec) => (
          <Card key={sec.title} style={{ padding: '14px 16px' }}>
            <div className="sec-head" style={{ marginBottom: 4 }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>{sec.title}</span>
              {sec.note && <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{sec.note}</span>}
            </div>
            {sec.exercises.map((e) => (
              <div className="exrow" key={e.id}>
                <div style={{ flex: 1 }}>
                  <div className="exname">{e.name}</div>
                  {editing ? (
                    <input
                      className="text"
                      style={{ marginTop: 6, maxWidth: 320 }}
                      defaultValue={e.dose}
                      aria-label={`Dose de ${e.name}`}
                      onBlur={(ev) => ev.target.value !== e.dose && saveDose(e.id, ev.target.value)}
                    />
                  ) : (
                    <div className="exdose">{e.dose}</div>
                  )}
                  {e.note && <div className="exnote">{e.note}</div>}
                  {e.kite && <div className="exkite">{e.kite}</div>}
                  {e.videoId && !editing && (
                    <a className="vidlink" aria-label={`Ver vídeo de ${e.name} no YouTube (abre em nova aba)`} href={`https://www.youtube.com/watch?v=${e.videoId}`} target="_blank" rel="noopener noreferrer">
                      <img src={`https://i.ytimg.com/vi/${e.videoId}/mqdefault.jpg`} alt="" onError={(ev) => ((ev.target as HTMLImageElement).style.display = 'none')} />
                      <span className="vt">
                        ▶ Ver vídeo
                        {e.videoBy && <span className="vc">{e.videoBy}</span>}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </Card>
        ))}
        <button className="btn primary full" style={{ minHeight: 54 }} onClick={() => onStart(t)}>
          Começar este treino
        </button>
      </div>
    </div>
  )
}
