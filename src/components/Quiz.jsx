import { useState } from 'react'

function Quiz({ questions, onComplete, isLocked, onNewTest }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    if (reviewMode) return // Don't allow selection in review mode
    
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    })
  }

  const handleNext = () => {
    if (reviewMode && currentQuestion === questions.length - 1) {
      // In review mode, after last question go back to results
      setReviewMode(false)
      setShowResults(true)
      setCurrentQuestion(0)
    } else if (currentQuestion < questions.length - 1) {
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

  const handleViewAnswers = () => {
    setShowResults(false)
    setReviewMode(true)
    setCurrentQuestion(0)
  }

  const handleNewTest = () => {
    setShowResults(false)
    setReviewMode(false)
    setCurrentQuestion(0)
    setSelectedAnswers({})
    onNewTest()
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

  if (!questions || questions.length === 0) {
    return (
      <div className="quiz-card">
        <h2 className="card-title">📝 Quiz Time</h2>
        <div className="locked-message">
          Loading questions...
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
        <h2 className="card-title">Test Results</h2>
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
          <div className="quiz-controls">
            <button onClick={handleViewAnswers} className="control-button">
              View Answers
            </button>
            <button onClick={handleNewTest} className="control-button">
              New Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const userAnswer = selectedAnswers[currentQuestion]
  const correctAnswer = question.correctAnswer

  return (
    <div className="quiz-card">
      <button className="quiz-close-button" onClick={handleNewTest} title="Cancel Quiz">
        ✕
      </button>
      <h2 className="card-title">📝 Quiz Time</h2>
      <div className="question-counter">
        Question {currentQuestion + 1} of {questions.length}
      </div>
      <div className="question-text">{question.question}</div>
      <div className="answers-list">
        {question.answers.map((answer, index) => {
          const isSelected = userAnswer === index
          const isCorrect = index === correctAnswer
          const isWrong = reviewMode && isSelected && !isCorrect
          
          let buttonClass = 'answer-button'
          if (isSelected) buttonClass += ' selected'
          if (reviewMode && isCorrect) buttonClass += ' correct'
          if (isWrong) buttonClass += ' wrong'
          
          return (
            <button
              key={index}
              className={buttonClass}
              onClick={() => handleAnswerSelect(currentQuestion, index)}
              disabled={reviewMode}
            >
              {answer}
              {reviewMode && isSelected && isCorrect && ' ✓'}
              {reviewMode && isWrong && ' ✗'}
              {reviewMode && isCorrect && !isSelected && ' ✓'}
            </button>
          )
        })}
      </div>
      <div className="quiz-controls">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="control-button"
        >
          Previous
        </button>
        {reviewMode ? (
          <button onClick={handleNext} className="control-button">
            {currentQuestion === questions.length - 1 ? 'Back to Results' : 'Next'}
          </button>
        ) : currentQuestion === questions.length - 1 ? (
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
