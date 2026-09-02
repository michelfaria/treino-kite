import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { backfillSkipped } from './lib/metrics'
import { Icons } from './components/ui'
import { Onboarding } from './screens/Onboarding'
import { Today, startSession } from './screens/Today'
import { Player } from './screens/Player'
import { Workouts } from './screens/Workouts'
import { Progress } from './screens/Progress'
import { History } from './screens/History'
import { Settings } from './screens/Settings'
import type { ProfileId, Session, WorkoutTemplate } from './types'

type Tab = 'today' | 'workouts' | 'progress' | 'settings'
const TABS: { id: Tab; label: string; icon: keyof typeof Icons }[] = [
  { id: 'today', label: 'Hoje', icon: 'today' },
  { id: 'workouts', label: 'Treinos', icon: 'workouts' },
  { id: 'progress', label: 'Evolução', icon: 'progress' },
  { id: 'settings', label: 'Perfil', icon: 'profile' },
]

export default function App() {
  const [profileId, setProfileId] = useState<ProfileId | null>(
    () => (localStorage.getItem('vf-profile') as ProfileId) || null,
  )
  const [tab, setTab] = useState<Tab>('today')
  const [playing, setPlaying] = useState<Session | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const profile = useLiveQuery(() => (profileId ? db.profiles.get(profileId) : undefined), [profileId])
  const sessions = useLiveQuery(
    () => (profileId ? db.sessions.where('profileId').equals(profileId).toArray() : []),
    [profileId],
  )

  // cargas da última sessão por exercício (pré-preenche o player)
  const lastLoads = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of [...(sessions ?? [])].sort((a, b) => a.date.localeCompare(b.date))) {
      for (const c of s.checks) if (c.load != null) m.set(c.exerciseId, c.load)
    }
    return m
  }, [sessions])

  useEffect(() => {
    if (profile) backfillSkipped(profile)
  }, [profile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // tema por perfil
  useEffect(() => {
    document.documentElement.dataset.theme = profile?.theme === 'rose' ? 'rose' : ''
  }, [profile?.theme])

  const pick = (id: ProfileId) => {
    localStorage.setItem('vf-profile', id)
    setProfileId(id)
    setTab('today')
  }

  if (!profileId || !profile) return <Onboarding onPick={pick} />

  const begin = async (t: WorkoutTemplate) => {
    const s = await startSession(profile, t)
    setPlaying(s)
  }

  if (playing) {
    return (
      <Player
        profile={profile}
        session={playing}
        lastLoads={lastLoads}
        onClose={() => setPlaying(null)}
      />
    )
  }

  return (
    <>
      {tab === 'today' && <Today profile={profile} onStart={begin} onResume={(s) => setPlaying(s)} />}
      {tab === 'workouts' && <Workouts profile={profile} onStart={begin} />}
      {tab === 'progress' &&
        (showHistory ? (
          <History profile={profile} onBack={() => setShowHistory(false)} />
        ) : (
          <Progress profile={profile} onHistory={() => setShowHistory(true)} />
        ))}
      {tab === 'settings' && (
        <Settings
          profile={profile}
          onSwitchProfile={() => {
            localStorage.removeItem('vf-profile')
            setProfileId(null)
          }}
        />
      )}

      <nav className="tabbar" aria-label="Navegação principal">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'active' : ''}
              aria-current={tab === t.id ? 'page' : undefined}
              onClick={() => {
                setTab(t.id)
                if (t.id !== 'progress') setShowHistory(false)
              }}
            >
              {Icons[t.icon]}
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
