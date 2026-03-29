import { useState, useEffect, useRef } from 'react'

const MODES = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

export function usePomodoro(onComplete) {
  const [mode, setMode] = useState('pomodoro')
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && !isCompleted) {
      setIsCompleted(true)
      setIsRunning(false)
      if (mode === 'pomodoro') onCompleteRef.current?.()
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, isCompleted, mode])

  const changeMode = (newMode) => {
    setMode(newMode)
    setTimeLeft(MODES[newMode])
    setIsRunning(false)
    setIsCompleted(false)
  }

  return {
    mode, timeLeft, isRunning, isCompleted,
    changeMode,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset: () => { setTimeLeft(MODES[mode]); setIsRunning(false); setIsCompleted(false) },
  }
}
