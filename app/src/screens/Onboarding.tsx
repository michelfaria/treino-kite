import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Waterline } from '../components/ui'
import type { ProfileId } from '../types'

export function Onboarding({ onPick }: { onPick: (id: ProfileId) => void }) {
  const profiles = (useLiveQuery(() => db.profiles.toArray(), []) ?? []).sort(
    (a, b) => (a.id === 'michel' ? -1 : 1) - (b.id === 'michel' ? -1 : 1),
  )
  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', justifyContent: 'center', paddingBottom: 40 }}>
      <p className="eyebrow">Ilhabela · treino em casa e ao ar livre</p>
      <h1 className="big" style={{ marginTop: 6, fontSize: '2rem' }}>
        Vento a Favor
      </h1>
      <div style={{ margin: '14px 0 6px', width: 120 }}>
        <Waterline />
      </div>
      <p style={{ color: 'var(--muted)', lineHeight: 1.5, marginBottom: 28 }}>
        Registre o que foi feito, veja sua evolução e mantenha a constância — sem culpa, sem enrolação.
      </p>
      <p className="eyebrow" style={{ marginBottom: 12 }}>Quem está treinando?</p>
      <div className="stack">
        {profiles.map((p) => (
          <button
            key={p.id}
            className="card row"
            style={{ textAlign: 'left', width: '100%' }}
            data-theme={p.theme === 'rose' ? 'rose' : undefined}
            onClick={() => onPick(p.id as ProfileId)}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>{p.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 3 }}>
                {p.id === 'michel' ? 'Kite Prep · 3 dias · 30 min' : 'Full body · 5 treinos · 45 min'}
              </div>
            </div>
            <span
              aria-hidden
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'var(--accent-grad)',
                display: 'grid', placeItems: 'center',
                color: 'var(--on-accent)', fontWeight: 800, fontSize: '1.1rem',
              }}
            >
              {p.name[0]}
            </span>
          </button>
        ))}
      </div>
      <p style={{ color: 'var(--faint)', fontSize: '0.78rem', marginTop: 26, lineHeight: 1.5 }}>
        Dica: adicione à tela de início (Compartilhar → Adicionar à Tela de Início) para abrir como app e treinar offline.
      </p>
    </div>
  )
}
