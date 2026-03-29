function PomodoroTimer({ mode, timeLeft, isRunning, isCompleted, onModeChange, onStart, onPause, onReset }) {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="pomodoro-card">
      <div className="panel-grid">
        <div className="tile-top tile-left">
          <button className={`mode-button ${mode === 'pomodoro' ? 'active' : ''}`} onClick={() => onModeChange('pomodoro')}>
            Pomodoro
          </button>
        </div>
        <div className="tile-top tile-center">
          <button className={`mode-button ${mode === 'shortBreak' ? 'active' : ''}`} onClick={() => onModeChange('shortBreak')}>
            Short Break
          </button>
        </div>
        <div className="tile-top tile-right">
          <button className={`mode-button ${mode === 'longBreak' ? 'active' : ''}`} onClick={() => onModeChange('longBreak')}>
            Long Break
          </button>
        </div>
        <div className="center-square">
          <div className="timer-display">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="timer-controls">
            {!isRunning ? (
              <button onClick={onStart} className="control-button start">
                {isCompleted ? 'Done' : 'Start'}
              </button>
            ) : (
              <button onClick={onPause} className="control-button pause">Pause</button>
            )}
            <button onClick={onReset} className="reset-button" title="Reset">↻</button>
          </div>
          {isCompleted && mode === 'pomodoro' && (
            <div className="reward-message">🎉 +10 🍎 Earned!</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PomodoroTimer
