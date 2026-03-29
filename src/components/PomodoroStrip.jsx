function PomodoroStrip({ mode, timeLeft, isRunning, isCompleted, onStart, onPause }) {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const modeLabel = mode === 'pomodoro' ? '🍅 Pomodoro' : mode === 'shortBreak' ? '☕ Break' : '🌙 Long Break'

  return (
    <div className="pomodoro-strip">
      <span className="strip-mode">{modeLabel}</span>
      <span className="strip-time">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      <button
        className="strip-btn"
        onClick={isRunning ? onPause : onStart}
        disabled={isCompleted}
        title={isRunning ? 'Pause' : isCompleted ? 'Done' : 'Start'}
      >
        {isRunning ? '⏸' : isCompleted ? '✓' : '▶'}
      </button>
    </div>
  )
}

export default PomodoroStrip
