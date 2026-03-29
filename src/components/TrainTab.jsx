import { useState } from 'react'
import PomodoroStrip from './PomodoroStrip'
import NotesViewer from './NotesViewer'
import FlashcardDeck from './FlashcardDeck'

function TrainTab({ pomodoro, session, nodeStatus }) {
  const [subTab, setSubTab] = useState('notes')

  const notesReady = nodeStatus.notes === 'done'
  const visualsReady = nodeStatus.visuals === 'done'
  const flashcardsReady = nodeStatus.flashcards === 'done'

  return (
    <div className="train-tab quiz-card">
      <PomodoroStrip
        mode={pomodoro.mode}
        timeLeft={pomodoro.timeLeft}
        isRunning={pomodoro.isRunning}
        isCompleted={pomodoro.isCompleted}
        onStart={pomodoro.start}
        onPause={pomodoro.pause}
      />

      <div className="sub-tab-nav">
        <button className={`sub-tab-btn ${subTab === 'notes' ? 'active' : ''}`} onClick={() => setSubTab('notes')}>
          📖 Notes
        </button>
        <button className={`sub-tab-btn ${subTab === 'flashcards' ? 'active' : ''}`} onClick={() => setSubTab('flashcards')}>
          🃏 Flashcards
        </button>
      </div>

      <div className="sub-tab-content">
        {subTab === 'notes' && (
          notesReady
            ? <NotesViewer notes={session.notes} diagrams={visualsReady ? session.diagrams : []} />
            : <div className="loading">Generating notes...</div>
        )}
        {subTab === 'flashcards' && (
          flashcardsReady
            ? <FlashcardDeck flashcards={session.flashcards} />
            : <div className="loading">Generating flashcards...</div>
        )}
      </div>
    </div>
  )
}

export default TrainTab
