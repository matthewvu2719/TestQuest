import { useState } from 'react'
import { usePomodoro } from './hooks/usePomodoro'
import PomodoroTimer from './components/PomodoroTimer'
import TrainTab from './components/TrainTab'
import TestTab from './components/TestTab'
import QuestGame from './components/QuestGame'
import FruitCounter from './components/FruitCounter'
import LandingPage from './components/LandingPage'
import SessionStart from './components/SessionStart'

function App() {
  const [phase, setPhase] = useState('landing') // 'landing' | 'start' | 'loading' | 'session'
  const [topic, setTopic] = useState('')
  const [nodeStatus, setNodeStatus] = useState({})
  const [session, setSession] = useState({
    notes: '', diagrams: [], flashcards: [],
    mcq: [], short_questions: [], long_questions: [],
    sources: [], source_urls: [],
  })
  const [activeTab, setActiveTab] = useState('pomodoro')
  const [totalFruits, setTotalFruits] = useState(0)
  const [showFruitAdded, setShowFruitAdded] = useState(false)

  const pomo = usePomodoro(() => {
    setTotalFruits(f => f + 10)
    setShowFruitAdded(true)
    setTimeout(() => setShowFruitAdded(false), 2000)
  })

  const startSession = async (topicText) => {
    setTopic(topicText)
    setPhase('loading')
    setNodeStatus({})
    setSession({ notes: '', diagrams: [], flashcards: [], mcq: [], short_questions: [], long_questions: [], sources: [], source_urls: [] })

    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicText }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const payload = JSON.parse(line.slice(6))
            if (payload.node === 'complete') {
              setPhase('session')
              setActiveTab('train')
            } else {
              setNodeStatus(prev => ({ ...prev, [payload.node]: 'done' }))
              if (payload.data) setSession(prev => ({ ...prev, ...payload.data }))
            }
          } catch { /* skip malformed lines */ }
        }
      }
    } catch (err) {
      console.error('Session start failed:', err)
      setPhase('start')
    }
  }

  if (phase === 'landing') {
    return (
      <div className="app">
        <LandingPage onEnterApp={() => setPhase('start')} />
      </div>
    )
  }

  if (phase === 'start' || phase === 'loading') {
    return (
      <div className="app">
        <Decorations />
        <header className="app-header">
          <FruitCounter totalFruits={totalFruits} />
        </header>
        <main className="app-main">
          <div className="center-container">
            <div className="main-card">
              <SessionStart
                onStart={startSession}
                isLoading={phase === 'loading'}
                nodeStatus={nodeStatus}
              />
            </div>
          </div>
        </main>
      </div>
    )
  }

  // phase === 'session'
  return (
    <div className="app">
      {showFruitAdded && <div className="fruit-toast">✅ +10 🍎 Earned!</div>}
      <Decorations />
      <header className="app-header">
        <FruitCounter totalFruits={totalFruits} />
      </header>
      <main className="app-main">
        <div className={`center-container ${activeTab === 'train' || activeTab === 'test' ? 'wide' : ''}`}>
          <div className="tab-navigation">
            {[
              { key: 'pomodoro', label: '🍎 Pomo' },
              { key: 'train',    label: '📖 Train' },
              { key: 'test',     label: '📝 Test' },
              { key: 'quest',    label: '🎮 Quest' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`tab-button ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="main-card">
            {activeTab === 'pomodoro' && (
              <PomodoroTimer
                mode={pomo.mode}
                timeLeft={pomo.timeLeft}
                isRunning={pomo.isRunning}
                isCompleted={pomo.isCompleted}
                onModeChange={pomo.changeMode}
                onStart={pomo.start}
                onPause={pomo.pause}
                onReset={pomo.reset}
              />
            )}
            {activeTab === 'train' && (
              <TrainTab pomodoro={pomo} session={session} nodeStatus={nodeStatus} />
            )}
            {activeTab === 'test' && (
              <TestTab
                session={session}
                topic={topic}
                nodeStatus={nodeStatus}
                onFruitsEarned={(f) => setTotalFruits(prev => prev + f)}
                onNewSession={() => { setPhase('start'); setTopic(''); setNodeStatus({}) }}
              />
            )}
            {activeTab === 'quest' && (
              <div className="quest-placeholder">
                <QuestGame
                  fruitCount={totalFruits}
                  resetFruits={() => setTotalFruits(0)}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Decorations() {
  return (
    <>
      <img src="/img/maincharacter1.png" className="decoration character1" alt="" />
      <img src="/img/maincharacter2.png" className="decoration character2" alt="" />
      <img src="/img/bunnyEnemy.png" className="decoration bunny" alt="" />
      <img src="/img/chameleon enemy.png" className="decoration chameleon" alt="" />
      <img src="/img/MushroomEnemy.png" className="decoration mushroom" alt="" />
      <img src="/img/trunkEnemy.png" className="decoration trunk" alt="" />
      <img src="/img/TerrainBox1.png" className="decoration box1" alt="" />
      <img src="/img/TerrainBox3.png" className="decoration box2" alt="" />
      <img src="/img/TerrainBox3.png" className="decoration box3" alt="" />
      <img src="/img/TerrainBox4.png" className="decoration box4" alt="" />
      <img src="/img/TerrainBox1.png" className="decoration box5" alt="" />
      <img src="/img/TerrainBox2.png" className="decoration box6" alt="" />
      <img src="/img/TerrainBox1.png" className="decoration box7" alt="" />
      <img src="/img/TerrainBox4.png" className="decoration box8" alt="" />
      <img src="/img/TerrainBox3.png" className="decoration box9" alt="" />
      <img src="/img/TerrainBox2.png" className="decoration box10" alt="" />
      <img src="/img/TerrainBox1.png" className="decoration box11" alt="" />
      <img src="/img/TerrainBox4.png" className="decoration box12" alt="" />
    </>
  )
}

export default App
