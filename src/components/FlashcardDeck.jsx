import { useState } from 'react'

function FlashcardDeck({ flashcards }) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!flashcards || flashcards.length === 0) return null

  const card = flashcards[current]

  const prev = () => { setCurrent(c => Math.max(0, c - 1)); setFlipped(false) }
  const next = () => { setCurrent(c => Math.min(flashcards.length - 1, c + 1)); setFlipped(false) }

  return (
    <div className="flashcard-deck">
      <div className="flashcard-counter">{current + 1} / {flashcards.length}</div>
      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
        <div className="flashcard-inner">
          <div className="flashcard-front">{card.front}</div>
          <div className="flashcard-back">{card.back}</div>
        </div>
      </div>
      <p className="flashcard-hint">Click card to flip</p>
      <div className="flashcard-controls">
        <button className="control-button" onClick={prev} disabled={current === 0}>Prev</button>
        <button className="control-button" onClick={next} disabled={current === flashcards.length - 1}>Next</button>
      </div>
    </div>
  )
}

export default FlashcardDeck
