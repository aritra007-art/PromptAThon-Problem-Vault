import React from 'react';
import { Server, Activity, HardDrive, ShieldAlert, RotateCw, Layers, Wifi, WifiOff } from 'lucide-react';
import { StorageNode } from '../types/node';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { formatBytes, formatTimeAgo } from '../services/cryptoService';

interface NodeCardProps {
  node: StorageNode;
  onSimulateFailure: (nodeId: string) => void;
  onRecover: (nodeId: string) => void;
  onViewObjects: (nodeId: string) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  onSimulateFailure,
  onRecover,
  onViewObjects,
}) => {
  const isHealthy = node.status === 'HEALTHY';
  const isOffline = node.status === 'OFFLINE';
  const isRecovering = node.status === 'RECOVERING';

  const usedPercentage = Math.round((node.usedBytes / node.capacityBytes) * 100);

  return (
    <div
      className={`rounded-xl border p-4.5 transition-all duration-200 relative overflow-hidden ${
        isHealthy
          ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
          : isOffline
          ? 'bg-slate-900/50 border-rose-900/40 opacity-90'
          : 'bg-slate-900/80 border-cyan-800/60'
      }`}
    >
      {/* Top row: Name, Endpoint, Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              isHealthy
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                : isOffline
                ? 'bg-rose-950/60 border-rose-800/60 text-rose-400'
                : 'bg-cyan-950/60 border-cyan-800/60 text-cyan-400'
            }`}
          >
            <Server className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono">{node.name}</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                {node.id}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
              <span>{node.endpoint}</span>
              <span>•</span>
              <span className="text-slate-500">{node.region}</span>
            </div>
          </div>
        </div>

        <StatusBadge status={node.status} size="sm" />
      </div>

      {/* Storage Disk Meter */}
      <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 mb-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            Storage Allocation
          </span>
          <span className="font-mono text-slate-200">
            {formatBytes(node.usedBytes)} / {formatBytes(node.capacityBytes)}
          </span>
        </div>

        <ProgressBar
          value={usedPercentage}
          color={usedPercentage > 85 ? 'rose' : usedPercentage > 70 ? 'amber' : 'cyan'}
          size="sm"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Utilization: <span className="font-mono text-slate-200 font-medium">{usedPercentage}%</span></span>
          <span>Available: <span className="font-mono text-slate-300">{formatBytes(node.capacityBytes - node.usedBytes)}</span></span>
        </div>
      </div>

      {/* Metrics Grid: Objects, Heartbeat, Latency */}
      <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-800/80 text-xs font-mono">
        <div>
          <span className="text-[10px] uppercase text-slate-500 block">Objects</span>
          <div className="flex items-center gap-1 text-slate-200 font-semibold mt-0.5">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>{node.storedObjectIds.length}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase text-slate-500 block">Heartbeat</span>
          <div className="flex items-center gap-1 mt-0.5">
            {isHealthy ? (
              <span className="text-emerald-400 text-xs font-medium">{formatTimeAgo(node.lastHeartbeat)}</span>
            ) : (
              <span className="text-rose-400 text-xs font-medium">Lost</span>
            )}
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase text-slate-500 block">Latency</span>
          <div className="flex items-center gap-1 mt-0.5">
            {isHealthy ? (
              <>
                <Wifi className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-200 text-xs font-medium">{node.latencyMs} ms</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span className="text-rose-400 text-xs">Timeout</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Failure reason if offline */}
      {isOffline && node.failureReason && (
        <div className="mt-2.5 p-2 rounded bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span className="truncate">{node.failureReason}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => onViewObjects(node.id)}
          className="text-xs text-slate-300 hover:text-cyan-300 hover:underline transition-colors font-medium cursor-pointer"
        >
          View {node.storedObjectIds.length} Hosted Objects →
        </button>

        <div className="flex items-center gap-2">
          {isHealthy ? (
            <button
              onClick={() => onSimulateFailure(node.id)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Simulate Failure</span>
            </button>
          ) : (
            <button
              onClick={() => onRecover(node.id)}
              disabled={isRecovering}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className={`w-3 h-3 ${isRecovering ? 'animate-spin' : ''}`} />
              <span>{isRecovering ? 'Recovering...' : 'Recover Node'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
