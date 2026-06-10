import { useEffect, useRef, useState } from 'react';

interface CountUpOptions {
  start?: number;
  duration?: number;
  decimals?: number;
  easing?: 'linear' | 'easeOut' | 'easeInOut';
}

/**
 * Animates a number from `start` to `end` over `duration` ms.
 * Begins when `trigger` is true.
 */
export function useCountUp(
  end: number,
  trigger: boolean,
  {
    start = 0,
    duration = 1400,
    decimals = 0,
    easing = 'easeOut',
  }: CountUpOptions = {}
) {
  const [value, setValue] = useState(start);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const startTime = performance.now();
    const diff = end - start;

    const ease = (t: number) => {
      if (easing === 'easeOut') return 1 - Math.pow(1 - t, 3);
      if (easing === 'easeInOut') return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      return t;
    };

    const tick = (now: number) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      setValue(parseFloat((start + diff * ease(elapsed)).toFixed(decimals)));
      if (elapsed < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, end, start, duration, decimals, easing]);

  return value;
}
