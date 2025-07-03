import React, { useState, useEffect } from 'react';

const PomodoroTimer = () => {
  const [minutes, setMinutes] = useState(25); // Start with 25 minutes for a Pomodoro
  const [seconds, setSeconds] = useState(0); // Seconds
  const [isActive, setIsActive] = useState(false); // Timer state
  const [isBreak, setIsBreak] = useState(false); // Break state

  // Format time for display
  const formatTime = (minutes, seconds) => {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Start or stop the timer
  useEffect(() => {
    let timer;

    if (isActive) {
      timer = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            if (isBreak) {
              setMinutes(25); // Reset to 25 minutes for work
              setSeconds(0);
              setIsBreak(false);
            } else {
              setMinutes(5); // Short break
              setSeconds(0);
              setIsBreak(true);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, minutes, seconds, isBreak]);

  // Start the timer
  const startTimer = () => setIsActive(true);

  // Stop the timer
  const stopTimer = () => setIsActive(false);

  // Reset the timer
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setIsBreak(false);
  };

  return (
    <div className="pomodoro-timer">
      <h1>Pomodoro Timer</h1>
      <div className="timer-display">
        <h2>{isBreak ? "Break Time!" : "Work Time!"}</h2>
        <p>{formatTime(minutes, seconds)}</p>
      </div>
      <div className="controls">
        {!isActive && (
          <button onClick={startTimer}>Start</button>
        )}
        {isActive && (
          <button onClick={stopTimer}>Pause</button>
        )}
        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
