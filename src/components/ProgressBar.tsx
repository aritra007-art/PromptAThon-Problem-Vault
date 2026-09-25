import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelPrefix?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'cyan',
  size = 'md',
  showLabel = false,
  labelPrefix = '',
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  const colorClasses = {
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
  }[color];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
          <span>{labelPrefix}</span>
          <span className="font-semibold text-slate-200">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heightClasses}`}>
        <div
          className={`${colorClasses} ${heightClasses} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
