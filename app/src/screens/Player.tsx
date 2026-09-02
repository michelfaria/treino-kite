import { useEffect, useMemo, useRef, useState } from 'react'
import { db, nowISO } from '../db'
import type { Profile, Session, SessionCheck, SessionContext } from '../types'

function beep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.setValueAtTime(0.001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    o.start()
    o.stop(ctx.currentTime + 0.55)
  } catch { /* áudio indisponível — segue o baile */ }
  if (navigator.vibrate) navigator.vibrate([180, 80, 180])
}

const FEELINGS: { v: 1 | 2 | 3 | 4 | 5; e: string; label: string }[] = [
  { v: 1, e: '😮‍💨', label: 'Pesado' },
  { v: 2, e: '😕', label: 'Difícil' },
  { v: 3, e: '🙂', label: 'Ok' },
  { v: 4, e: '😄', label: 'Bem' },
  { v: 5, e: '🤩', label: 'Voando' },
]

const CONTEXTS: { v: SessionContext; label: string }[] = [
  { v: 'casa', label: '🏠 Casa' },
  { v: 'academia', label: '🏋️ Academia' },
  { v: 'ar-livre', label: '🌴 Ar livre' },
  { v: 'kite', label: '🪁 Kite' },
]

export function Player({
  profile,
  session,
  lastLoads,
  onClose,
}: {
  profile: Profile
  session: Session
  lastLoads: Map<string, number>
  onClose: () => void
}) {
  const sections = session.snapshot ?? []
  const allExercises = useMemo(() => sections.flatMap((s) => s.exercises), [sections])
  const [checks, setChecks] = useState<Map<string, SessionCheck>>(
    () => new Map(session.checks.map((c) => [c.exerciseId, c])),
  )
  const [rest, setRest] = useState<number | null>(null)
  const [liveMsg, setLiveMsg] = useState('')
  const [finishing, setFinishing] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [feeling, setFeeling] = useState<1 | 2 | 3 | 4 | 5 | undefined>()
  const [pain, setPain] = useState(false)
  const [context, setContext] = useState<SessionContext>('casa')
  const restRef = useRef<number | null>(null)

  const doneCount = [...checks.values()].filter((c) => c.done).length
  const pct = allExercises.length ? doneCount / allExercises.length : 0

  const persist = (m: Map<string, SessionCheck>) => {
    db.sessions.update(session.id, { checks: [...m.values()], updatedAt: nowISO() })
  }

  const toggle = (exerciseId: string) => {
    setChecks((prev) => {
      const m = new Map(prev)
      const cur = m.get(exerciseId)
      const done = !(cur?.done ?? false)
      m.set(exerciseId, { ...cur, exerciseId, done })
      persist(m)
      if (done && [...m.values()].filter((c) => c.done).length < allExercises.length) {
        setRest(60)
        setLiveMsg('Descanso de 60 segundos iniciado')
      }
      return m
    })
  }

  const setLoad = (exerciseId: string, load: number | undefined) => {
    setChecks((prev) => {
      const m = new Map(prev)
      const cur = m.get(exerciseId)
      m.set(exerciseId, { exerciseId, done: cur?.done ?? false, ...cur, load })
      persist(m)
      return m
    })
  }

  // timer de descanso
  useEffect(() => {
    if (rest == null) return
    if (rest <= 0) {
      beep()
      setLiveMsg('Descanso encerrado — vai!')
      const t = setTimeout(() => setRest(null), 1200)
      return () => clearTimeout(t)
    }
    restRef.current = window.setTimeout(() => setRest((r) => (r == null ? null : r - 1)), 1000)
    return () => {
      if (restRef.current) clearTimeout(restRef.current)
    }
  }, [rest])

  // sheet de finalização como <dialog> nativo (foco preso, Esc fecha)
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (finishing && !d.open) d.showModal()
    if (!finishing && d.open) d.close()
  }, [finishing])

  async function finish() {
    const status = pct >= 0.8 ? 'done' : doneCount >= 1 ? 'partial' : 'skipped'
    await db.sessions.update(session.id, {
      status,
      finishedAt: nowISO(),
      feeling,
      painFlag: profile.id === 'michel' ? pain : undefined,
      context,
      updatedAt: nowISO(),
    })
    onClose()
  }

  async function discard() {
    if (doneCount === 0) {
      await db.sessions.delete(session.id)
      onClose()
    } else {
      setFinishing(true)
    }
  }

  return (
    <div className="screen" style={{ paddingBottom: 140 }}>
      <div className="row" style={{ marginBottom: 10 }}>
        <button className="btn ghost" onClick={discard} aria-label="Sair do treino" style={{ minHeight: 40, paddingLeft: 0 }}>
          ‹ Sair
        </button>
        <span className="eyebrow num">
          {doneCount}/{allExercises.length}
        </span>
      </div>
      <h1 className="big" style={{ fontSize: '1.3rem' }}>{session.templateTitle}</h1>
      <div className="progress-track" style={{ margin: '14px 0 20px' }} role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da sessão">
        <div className="progress-fill" style={{ width: `${pct * 100}%` }} />
      </div>

      <div className="stack">
        {sections.map((sec) => (
          <div className="card" key={sec.title} style={{ padding: '14px 16px' }}>
            <div className="row" style={{ marginBottom: 4 }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>{sec.title}</span>
              {sec.note && <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{sec.note}</span>}
            </div>
            {sec.exercises.map((e) => {
              const c = checks.get(e.id)
              const done = c?.done ?? false
              return (
                <div className={`exrow${done ? ' done' : ''}`} key={e.id}>
                  <button
                    className="check"
                    role="checkbox"
                    aria-checked={done}
                    aria-label={`${e.name} — marcar como feito`}
                    onClick={() => toggle(e.id)}
                  >
                    ✓
                  </button>
                  <div style={{ flex: 1 }}>
                    <div className="exname">{e.name}</div>
                    <div className="exdose">{e.dose}</div>
                    {e.note && <div className="exnote">{e.note}</div>}
                    {e.kite && <div className="exkite">{e.kite}</div>}
                    {e.tracksLoad && (
                      <label className="loadfield">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.5"
                          min="0"
                          placeholder={lastLoads.get(e.id)?.toString() ?? '—'}
                          value={c?.load ?? ''}
                          onChange={(ev) => setLoad(e.id, ev.target.value === '' ? undefined : Number(ev.target.value))}
                          aria-label={`Carga de ${e.name} em quilos`}
                        />
                        <span>kg</span>
                      </label>
                    )}
                    {e.videoId && (
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
              )
            })}
          </div>
        ))}
        <button className="btn primary full" style={{ minHeight: 54 }} onClick={() => setFinishing(true)}>
          Finalizar treino
        </button>
      </div>

      <span className="sr-only" aria-live="polite">{liveMsg}</span>
      {rest != null && (
        <div className="resttimer" role="timer" aria-label="Descanso">
          <span className="eyebrow">Descanso</span>
          <span className="num">{rest > 0 ? `${rest}s` : 'Vai! 💨'}</span>
          <button className="chip" onClick={() => setRest((r) => (r ?? 0) + 30)}>+30s</button>
          <button className="chip" onClick={() => setRest(90)}>90s</button>
          <button className="chip" aria-label="Fechar timer" onClick={() => setRest(null)}>✕</button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="sheet"
        aria-label="Finalizar treino"
        onClose={() => setFinishing(false)}
        onClick={(e) => e.target === dialogRef.current && setFinishing(false)}
      >
        {finishing && (
          <div style={{ padding: 22 }}>
            <div style={{ width: 64, margin: '0 auto 16px' }}><hr className="waterline" /></div>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>
              {pct >= 0.8 ? 'Treino completo! 🎉' : doneCount > 0 ? 'Registrado — parcial também conta.' : 'Encerrar sem exercícios?'}
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 18 }}>
              {doneCount} de {allExercises.length} exercícios · será salvo como{' '}
              <b>{pct >= 0.8 ? 'feito' : doneCount >= 1 ? 'parcial' : 'pulado'}</b>
            </p>

            <p className="eyebrow" style={{ marginBottom: 8 }}>Como se sentiu?</p>
            <div className="feeling-row" role="group" aria-label="Como se sentiu">
              {FEELINGS.map((f) => (
                <button key={f.v} aria-pressed={feeling === f.v} aria-label={f.label} className={feeling === f.v ? 'sel' : ''} onClick={() => setFeeling(f.v)}>
                  {f.e}
                </button>
              ))}
            </div>

            <p className="eyebrow" style={{ margin: '16px 0 8px' }}>Onde treinou?</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CONTEXTS.map((c) => (
                <button key={c.v} className={`chip${context === c.v ? ' on' : ''}`} onClick={() => setContext(c.v)}>
                  {c.label}
                </button>
              ))}
            </div>

            {profile.id === 'michel' && (
              <div className="row" style={{ marginTop: 18 }}>
                <span style={{ fontSize: '0.9rem' }}>Senti a virilha hoje</span>
                <button role="switch" aria-checked={pain} aria-label="Senti a virilha hoje" className="switch" onClick={() => setPain(!pain)} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setFinishing(false)}>
                Voltar
              </button>
              <button className="btn primary" style={{ flex: 2 }} onClick={finish}>
                Salvar
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
