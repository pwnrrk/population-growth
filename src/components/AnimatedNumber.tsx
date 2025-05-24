import React, { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  target: number;
  shouldAnimate: boolean;
  duration?: number; // in ms
  fps?: number; // target frame rate
  formatter?: (value: number) => string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  target,
  shouldAnimate,
  duration = 1000,
  fps = 60,
  formatter = (val) => val.toFixed(0),
}) => {
  const [value, setValue] = useState(target);
  const startValue = useRef(target);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number>(null);
  const lastFrameTime = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldAnimate) {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      setValue(target);
      return;
    }

    startValue.current = value;
    startTime.current = null;
    lastFrameTime.current = null;

    const interval = 1000 / fps;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;

      if (
        !lastFrameTime.current ||
        timestamp - lastFrameTime.current >= interval
      ) {
        lastFrameTime.current = timestamp;

        const progress = Math.min(elapsed / duration, 1);
        const current =
          startValue.current + (target - startValue.current) * progress;
        setValue(current);
      }

      if (elapsed < duration) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [target, shouldAnimate, duration, fps, value]);

  return <span>{formatter(Math.round(value))}</span>;
};

export default AnimatedNumber;
