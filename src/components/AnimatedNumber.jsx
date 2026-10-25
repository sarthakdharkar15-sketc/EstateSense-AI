import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedNumber Component
 * Apple-style smooth ease-out number counter for valuation totals and financial metrics.
 * Respects prefers-reduced-motion and uses tabular-nums for zero layout shifting.
 */
export default function AnimatedNumber({ 
  value, 
  prefix = '', 
  suffix = '', 
  duration = 650, 
  decimals = 2,
  className = '' 
}) {
  const target = typeof value === 'number' ? value : parseFloat(value) || 0;
  const [displayValue, setDisplayValue] = useState(target);
  const prevTargetRef = useRef(target);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(target);
      prevTargetRef.current = target;
      return;
    }

    const startValue = prevTargetRef.current;
    const diff = target - startValue;
    if (Math.abs(diff) < 0.001) {
      setDisplayValue(target);
      return;
    }

    let startTime = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apple HIG ease-out cubic: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
        prevTargetRef.current = target;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span className={`tabular-nums inline-block ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
