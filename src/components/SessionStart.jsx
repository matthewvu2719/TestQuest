import { useState } from 'react'

const NODE_LABELS = [
  { key: 'fetch',      label: 'Gathering sources' },
  { key: 'notes',      label: 'Writing notes' },
  { key: 'quiz',       label: 'Creating exam' },
  { key: 'flashcards', label: 'Making flashcards' },
  { key: 'visuals',    label: 'Drawing diagrams' },
]

function SessionStart({ onStart, isLoading, nodeStatus }) {
  const [topic, setTopic] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (topic.trim()) onStart(topic.trim())
  }

  if (isLoading) {
    return (
      <div className="topic-input-container">
        <h1 className="title">Preparing your session...</h1>
        <div className="node-status-list">
          {NODE_LABELS.map(({ key, label }) => (
            <div key={key} className={`node-status-item ${nodeStatus[key] === 'done' ? 'done' : 'waiting'}`}>
              <span className="node-icon">{nodeStatus[key] === 'done' ? '✅' : <span className="hourglass-spin">⏳</span>}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="topic-input-container">
      <h1 className="title">What are you training today?</h1>
      <p className="subtitle">Enter a topic to generate notes, flashcards & an exam</p>
      <form onSubmit={handleSubmit} className="topic-form">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Photosynthesis, World War 2..."
          className="topic-input"
          autoFocus
        />
        <button type="submit" className="start-button">
          Start Session
        </button>
      </form>
    </div>
  )
}

export default SessionStart
