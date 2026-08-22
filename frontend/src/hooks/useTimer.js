import { useState, useEffect, useCallback } from 'react';

export const useTimer = (isActive = true) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const resetTimer = useCallback(() => {
    setSeconds(0);
  }, []);

  return {
    seconds,
    resetTimer
  };
};
