import React from 'react';
import { NodeStatus } from '../types/node';
import { ObjectStatus, ReplicaStatus } from '../types/object';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Radio } from 'lucide-react';

interface StatusBadgeProps {
  status:
    | NodeStatus
    | ObjectStatus
    | ReplicaStatus
    | 'HEALTHY'
    | 'DEGRADED'
    | 'CRITICAL'
    | 'MATCHED'
    | 'MISMATCH';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  let colorStyles = '';
  let label = status as string;
  let IconComponent = CheckCircle2;

  switch (status) {
    case 'HEALTHY':
    case 'MATCHED':
      colorStyles = 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60';
      label = 'Healthy';
      IconComponent = CheckCircle2;
      break;

    case 'OFFLINE':
      colorStyles = 'bg-rose-950/70 text-rose-400 border-rose-800/60';
      label = 'Offline';
      IconComponent = XCircle;
      break;

    case 'DEGRADED':
    case 'STALE':
      colorStyles = 'bg-amber-950/70 text-amber-400 border-amber-800/60';
      label = status === 'STALE' ? 'Stale Version' : 'Degraded';
      IconComponent = AlertTriangle;
      break;

    case 'REPAIR_REQUIRED':
      colorStyles = 'bg-amber-950/80 text-amber-300 border-amber-700/70 animate-pulse';
      label = 'Repair Required';
      IconComponent = AlertTriangle;
      break;

    case 'CORRUPTED':
    case 'MISMATCH':
      colorStyles = 'bg-rose-950/90 text-rose-300 border-rose-700/80 animate-pulse';
      label = 'Corrupted';
      IconComponent = XCircle;
      break;

    case 'RECOVERING':
    case 'REPAIRING':
    case 'SYNCING':
      colorStyles = 'bg-cyan-950/70 text-cyan-300 border-cyan-800/70';
      label = status === 'RECOVERING' ? 'Recovering' : status === 'SYNCING' ? 'Syncing' : 'Repairing';
      IconComponent = RefreshCw;
      break;

    case 'CRITICAL':
      colorStyles = 'bg-red-950/90 text-red-300 border-red-700 animate-pulse';
      label = 'Critical Quorum Loss';
      IconComponent = XCircle;
      break;

    default:
      colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';
      IconComponent = Radio;
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const isSpinning = status === 'RECOVERING' || status === 'REPAIRING' || status === 'SYNCING';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${sizeStyles} ${colorStyles}`}
    >
      {showIcon && (
        <IconComponent className={`${iconSizes} ${isSpinning ? 'animate-spin' : ''}`} />
      )}
      <span>{label}</span>
    </span>
  );
};
