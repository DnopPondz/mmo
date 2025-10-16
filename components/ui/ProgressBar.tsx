'use client';

import clsx from 'clsx';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: string;
}

export function ProgressBar({ value, max, color = 'from-cyan-400 to-blue-500', height = 'h-3' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={clsx('w-full overflow-hidden rounded-full bg-slate-800/70 shadow-inner', height)}>
      <div
        className={clsx('h-full bg-gradient-to-r transition-all duration-500 ease-out', color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
