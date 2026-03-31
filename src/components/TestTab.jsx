import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { API_BASE } from '../config'

function TestTab({ session, topic, nodeStatus, userId, onFruitsEarned, onNewSession }) {
  const [subTab, setSubTab] = useState('mcq')
  const [mcqAnswers, setMcqAnswers] = useState({})
  const [shortAnswers, setShortAnswers] = useState({})
  const [longAnswers, setLongAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const [resultsTab, setResultsTab] = useState('mcq')

  const quizReady = nodeStatus.quiz === 'done'

  if (!quizReady) {
    return (
      <div className="quiz-card">
        <div className="loading">Generating exam...</div>
      </div>
    )
  }

  if (results) {
    const mcqCorrect = session.mcq.filter((q, i) => mcqAnswers[i] === q.correct_answer).length
    const shortAnswered = session.short_questions.filter((_, i) => shortAnswers[i]?.trim()).length
    const longAnswered = session.long_questions.filter((_, i) => longAnswers[i]?.trim()).length

    return (
      <div className="quiz-card results-panel">
        <div className="results-header">
          <h2 className="results-title">Results</h2>
          <div className="results-score">{results.score}%</div>
          <div className="results-breakdown">
            <span>MCQ: {mcqCorrect}/{session.mcq.length}</span>
            <span>Short: {shortAnswered}/{session.short_questions.length}</span>
            <span>Long: {longAnswered}/{session.long_questions.length}</span>
          </div>
          {results.fruits_earned > 0 && (
            <div className="reward-message">🎉 +{results.fruits_earned} 🍎 Earned!</div>
          )}
        </div>

        <div className="sub-tab-nav">
          {[
            { key: 'mcq',      label: `MCQ (${mcqCorrect}/${session.mcq.length})` },
            { key: 'short',    label: 'Short' },
            { key: 'long',     label: 'Long' },
            { key: 'insights', label: 'Insights' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`sub-tab-btn ${resultsTab === key ? 'active' : ''}`}
              onClick={() => setResultsTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="sub-tab-content results-review">
          <div className="exam-content-wrap">
          {resultsTab === 'mcq' && (
            <div className="review-questions">
              {session.mcq.map((q, qi) => {
                const userAns = mcqAnswers[qi] ?? -1
                const correct = userAns === q.correct_answer
                return (
                  <div key={qi} className={`review-question ${correct ? 'correct' : 'wrong'}`}>
                    <p className="review-question-text">{qi + 1}. {q.question}</p>
                    <div className="review-answers">
                      {q.answers.map((ans, ai) => {
                        let cls = 'review-answer'
                        if (ai === q.correct_answer) cls += ' review-correct'
                        if (ai === userAns && !correct) cls += ' review-wrong'
                        return <div key={ai} className={cls}>{ans}</div>
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {resultsTab === 'short' && (
            <div className="review-questions">
              {session.short_questions.map((q, qi) => (
                <div key={qi} className="review-question">
                  <p className="review-question-text">{qi + 1}. {q.question}</p>
                  <div className="review-answer-pair">
                    <div className="review-your-answer">
                      <span className="review-label">Your answer:</span>
                      <span>{shortAnswers[qi]?.trim() || <em>No answer</em>}</span>
                    </div>
                    <div className="review-sample-answer">
                      <span className="review-label">Sample answer:</span>
                      <span>{q.sample_answer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resultsTab === 'long' && (
            <div className="review-questions">
              {session.long_questions.map((q, qi) => (
                <div key={qi} className="review-question">
                  <p className="review-question-text">{qi + 1}. {q.question}</p>
                  <div className="review-answer-pair">
                    <div className="review-your-answer">
                      <span className="review-label">Your answer:</span>
                      <p>{longAnswers[qi]?.trim() || <em>No answer</em>}</p>
                    </div>
                    <div className="review-sample-answer">
                      <span className="review-label">Sample answer:</span>
                      <p>{q.sample_answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resultsTab === 'insights' && (
            <div className="insights-body">
              <ReactMarkdown>{results.insights}</ReactMarkdown>
            </div>
          )}
          </div>
        </div>

        <div className="results-footer">
          <button className="control-button new-session-btn" onClick={onNewSession}>New Session</button>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const mcqArr = session.mcq.map((_, i) => mcqAnswers[i] ?? -1)
      const shortArr = session.short_questions.map((_, i) => shortAnswers[i] ?? '')
      const longArr = session.long_questions.map((_, i) => longAnswers[i] ?? '')

      const res = await fetch(`${API_BASE}/api/session/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          sources: session.sources,
          mcq: session.mcq,
          short_questions: session.short_questions,
          long_questions: session.long_questions,
          user_answers: { mcq: mcqArr, short: shortArr, long: longArr },
          user_id: userId,
          notes: session.notes,
          flashcards: session.flashcards,
        }),
      })
      const data = await res.json()
      setResults(data)
      if (data.fruits_earned > 0) onFruitsEarned(data.fruits_earned)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="quiz-card test-tab">
      <div className="sub-tab-nav">
        <button className={`sub-tab-btn ${subTab === 'mcq' ? 'active' : ''}`} onClick={() => setSubTab('mcq')}>
          MCQ ({Object.keys(mcqAnswers).length}/{session.mcq.length})
        </button>
        <button className={`sub-tab-btn ${subTab === 'short' ? 'active' : ''}`} onClick={() => setSubTab('short')}>
          Short
        </button>
        <button className={`sub-tab-btn ${subTab === 'long' ? 'active' : ''}`} onClick={() => setSubTab('long')}>
          Long
        </button>
      </div>

      <div className="sub-tab-content">
        <div className="exam-content-wrap">
          {subTab === 'mcq' && (
            <div className="exam-questions">
              {session.mcq.map((q, qi) => (
                <div key={qi} className="exam-question">
                  <p className="question-text">{qi + 1}. {q.question}</p>
                  <div className="answers-list">
                    {q.answers.map((ans, ai) => (
                      <button
                        key={ai}
                        className={`answer-button ${mcqAnswers[qi] === ai ? 'selected' : ''}`}
                        onClick={() => setMcqAnswers(prev => ({ ...prev, [qi]: ai }))}
                      >
                        {ans}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {subTab === 'short' && (
            <div className="exam-questions">
              {session.short_questions.map((q, qi) => (
                <div key={qi} className="exam-question">
                  <p className="question-text">{qi + 1}. {q.question}</p>
                  <input
                    type="text"
                    className="topic-input short-answer-input"
                    placeholder="Your answer..."
                    value={shortAnswers[qi] || ''}
                    onChange={(e) => setShortAnswers(prev => ({ ...prev, [qi]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          {subTab === 'long' && (
            <div className="exam-questions">
              {session.long_questions.map((q, qi) => (
                <div key={qi} className="exam-question">
                  <p className="question-text">{qi + 1}. {q.question}</p>
                  <textarea
                    className="long-answer-input"
                    placeholder="Your answer..."
                    value={longAnswers[qi] || ''}
                    onChange={(e) => setLongAnswers(prev => ({ ...prev, [qi]: e.target.value }))}
                    rows={5}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="exam-submit-row">
        {subTab === 'mcq' && (
          <button className="control-button submit" onClick={() => setSubTab('short')}>
            Next Page
          </button>
        )}
        {subTab === 'short' && (
          <button className="control-button submit" onClick={() => setSubTab('long')}>
            Next Page
          </button>
        )}
        {subTab === 'long' && (
          <button className="control-button submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        )}
      </div>
    </div>
  )
}

export default TestTab
