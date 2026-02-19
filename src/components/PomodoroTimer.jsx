import { useState, useEffect } from 'react'

function PomodoroTimer({ onComplete, isLocked }) {
  const [mode, setMode] = useState('pomodoro')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const modes = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  }

  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && !isCompleted) {
      setIsCompleted(true)
      setIsRunning(false)
      if (mode === 'pomodoro') {
        onComplete()
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, isCompleted, onComplete, mode])

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setTimeLeft(modes[newMode])
    setIsRunning(false)
    setIsCompleted(false)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setTimeLeft(modes[mode])
    setIsRunning(false)
    setIsCompleted(false)
  }

  return (
    <div className={`pomodoro-card ${isLocked ? 'locked' : ''}`}>
      <div className="panel-grid">
        {/* Top 3 tiles */}
        <div className="tile-top tile-left">
          <button 
            className={`mode-button ${mode === 'pomodoro' ? 'active' : ''}`}
            onClick={() => handleModeChange('pomodoro')}
          >
            Pomodoro
          </button>
        </div>
        <div className="tile-top tile-center">
          <button 
            className={`mode-button ${mode === 'shortBreak' ? 'active' : ''}`}
            onClick={() => handleModeChange('shortBreak')}
          >
            Short Break
          </button>
        </div>
        <div className="tile-top tile-right">
          <button 
            className={`mode-button ${mode === 'longBreak' ? 'active' : ''}`}
            onClick={() => handleModeChange('longBreak')}
          >
            Long Break
          </button>
        </div>
        
        {/* Center black square */}
        <div className="center-square">
          <div className="timer-display">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          
          <div className="timer-controls">
            {!isRunning ? (
              <button onClick={handleStart} className="control-button start" disabled={isLocked}>
                {isCompleted ? 'Done' : 'Start'}
              </button>
            ) : (
              <button onClick={handlePause} className="control-button pause">
                Pause
              </button>
            )}
            <button onClick={handleReset} className="reset-button" title="Reset">
              ↻
            </button>
          </div>
          
          {isCompleted && mode === 'pomodoro' && (
            <div className="reward-message">
              🎉 +10 🍎 Earned!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PomodoroTimer
