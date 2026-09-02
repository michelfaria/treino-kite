import { useRef, useState } from 'react'
import { db, exportBackup, importBackup, nowISO, type BackupFile } from '../db'
import { Card, Switch, Waterline } from '../components/ui'
import { WEEKDAYS_SHORT } from '../lib/dates'
import type { Profile } from '../types'

export function Settings({ profile, onSwitchProfile }: { profile: Profile; onSwitchProfile: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [notifState, setNotifState] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')

  const update = async (patch: Partial<Profile>) => {
    await db.profiles.update(profile.id, { ...patch, updatedAt: nowISO() })
  }

  const reminder = profile.reminders[0] ?? { id: 'rem-new', daysOfWeek: [], time: '07:00', enabled: false }

  const toggleDay = (d: number) => {
    const days = reminder.daysOfWeek.includes(d)
      ? reminder.daysOfWeek.filter((x) => x !== d)
      : [...reminder.daysOfWeek, d].sort()
    update({ reminders: [{ ...reminder, daysOfWeek: days }] })
  }

  const doExport = async () => {
    const data = await exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vento-a-favor-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Backup exportado. Guarde o arquivo num lugar seguro (Drive, iCloud…).')
  }

  const doImport = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as BackupFile
      await importBackup(data)
      setMsg(`Backup importado: ${data.sessions?.length ?? 0} sessões restauradas.`)
    } catch (e) {
      setMsg(`Não foi possível importar: ${e instanceof Error ? e.message : 'arquivo inválido'}.`)
    }
  }

  const askNotif = async () => {
    if (typeof Notification === 'undefined') return
    const p = await Notification.requestPermission()
    setNotifState(p)
  }

  return (
    <div className="screen">
      <p className="eyebrow">Perfil</p>
      <div className="row" style={{ marginTop: 4, marginBottom: 18 }}>
        <h1 className="big">{profile.name}</h1>
        <button className="chip" onClick={onSwitchProfile}>Trocar perfil</button>
      </div>

      <div className="stack">
        <Card>
          <h2 className="eyebrow" style={{ marginBottom: 12 }}>Meta semanal</h2>
          <div className="row">
            <span style={{ fontSize: '0.92rem' }}>Sessões por semana</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="chip" aria-label="Diminuir meta" onClick={() => profile.weeklyGoal > 1 && update({ weeklyGoal: profile.weeklyGoal - 1 })}>−</button>
              <b className="num" role="status" style={{ fontSize: '1.3rem', minWidth: 22, textAlign: 'center' }}>{profile.weeklyGoal}</b>
              <button className="chip" aria-label="Aumentar meta" onClick={() => profile.weeklyGoal < 7 && update({ weeklyGoal: profile.weeklyGoal + 1 })}>+</button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="row" style={{ marginBottom: 12 }}>
            <h2 className="eyebrow">Lembretes</h2>
            <Switch checked={reminder.enabled} label="Ativar lembretes" onChange={(v) => update({ reminders: [{ ...reminder, enabled: v }] })} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {WEEKDAYS_SHORT.map((w, d) => (
              <button key={d} className={`chip${reminder.daysOfWeek.includes(d) ? ' on' : ''}`} onClick={() => toggleDay(d)}>
                {w}
              </button>
            ))}
          </div>
          <div className="row">
            <span style={{ fontSize: '0.92rem' }}>Horário</span>
            <input
              className="text"
              style={{ width: 110 }}
              type="time"
              value={reminder.time}
              onChange={(e) => update({ reminders: [{ ...reminder, time: e.target.value }] })}
              aria-label="Horário do lembrete"
            />
          </div>
          <hr className="hr" />
          {notifState === 'granted' ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
              Notificações permitidas ✓ — os dias marcados aparecem na tela Hoje. Push com o app fechado chega na Fase 2 (precisa de um pequeno servidor).
            </p>
          ) : notifState === 'unsupported' ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Este navegador não suporta notificações.</p>
          ) : (
            <button className="btn full" onClick={askNotif}>Permitir notificações</button>
          )}
        </Card>

        <Card>
          <div className="row">
            <div>
              <h2 className="eyebrow">Assistente IA</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 6, lineHeight: 1.5 }}>
                Frases personalizadas e resumo semanal. Chega na Fase 3 — o app funciona 100% sem ela.
              </p>
            </div>
            <Switch checked={profile.aiOptIn} label="Ativar IA" onChange={(v) => update({ aiOptIn: v })} />
          </div>
        </Card>

        <Card>
          <h2 className="eyebrow" style={{ marginBottom: 12 }}>Backup</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" style={{ flex: 1, whiteSpace: 'nowrap' }} onClick={doExport}>Exportar</button>
            <button className="btn" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>Importar</button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
            />
          </div>
          {msg && <p role="status" style={{ color: 'var(--accent-2)', fontSize: '0.8rem', marginTop: 10 }}>{msg}</p>}
          <p style={{ color: 'var(--faint)', fontSize: '0.75rem', marginTop: 10, lineHeight: 1.5 }}>
            Seus dados vivem só neste aparelho (IndexedDB). Exporte de vez em quando — é o seu seguro.
          </p>
        </Card>

        <Card>
          <h2 className="eyebrow">Sobre</h2>
          <div style={{ margin: '10px 0', width: 72 }}><Waterline /></div>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>
            <b style={{ color: 'var(--txt)' }}>Vento a Favor</b> · treinos em casa e ao ar livre, feito em Ilhabela.
            Dados 100% locais, sem cookies, sem analytics. Os treinos não substituem avaliação de educador físico
            ou médico; dor aguda = pare e procure avaliação.
          </p>
        </Card>
      </div>
    </div>
  )
}
