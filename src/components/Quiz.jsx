import React, { useState } from 'react'

function Quiz({ questions, onComplete, isLocked }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    const correctAnswers = questions.filter(
      (q, index) => selectedAnswers[index] === q.correctAnswer
    ).length
    const percentage = (correctAnswers / questions.length) * 100
    setShowResults(true)
    onComplete(percentage)
  }

  const calculateReward = () => {
    const correctAnswers = questions.filter(
      (q, index) => selectedAnswers[index] === q.correctAnswer
    ).length
    const percentage = (correctAnswers / questions.length) * 100
    
    if (percentage >= 90) return 20
    if (percentage >= 80) return 10
    if (percentage >= 70) return 5
    return 0
  }

  if (isLocked) {
    return (
      <div className="quiz-card locked">
        <h2 className="card-title">📝 Quiz Time</h2>
        <div className="locked-message">
          🔒 Complete the study session to unlock the quiz!
        </div>
      </div>
    )
  }

  if (showResults) {
    const correctAnswers = questions.filter(
      (q, index) => selectedAnswers[index] === q.correctAnswer
    ).length
    const percentage = Math.round((correctAnswers / questions.length) * 100)
    const reward = calculateReward()

    return (
      <div className="quiz-card">
        <h2 className="card-title">🎉 Quiz Results</h2>
        <div className="results-display">
          <div className="score">
            {correctAnswers} / {questions.length}
          </div>
          <div className="percentage">{percentage}%</div>
          {reward > 0 && (
            <div className="reward-message">
              🎉 +{reward} 🍎 Earned!
            </div>
          )}
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="quiz-card">
      <h2 className="card-title">📝 Quiz Time</h2>
      <div className="question-counter">
        Question {currentQuestion + 1} of {questions.length}
      </div>
      <div className="question-text">{question.question}</div>
      <div className="answers-list">
        {question.answers.map((answer, index) => (
          <button
            key={index}
            className={`answer-button ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
            onClick={() => handleAnswerSelect(currentQuestion, index)}
          >
            {answer}
          </button>
        ))}
      </div>
      <div className="quiz-controls">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="control-button"
        >
          Previous
        </button>
        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length !== questions.length}
            className="control-button submit"
          >
            Submit Quiz
          </button>
        ) : (
          <button onClick={handleNext} className="control-button">
            Next
          </button>
        )}
      </div>
    </div>
  )
}

export default Quiz
