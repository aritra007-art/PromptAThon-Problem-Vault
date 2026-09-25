import React from 'react';
import { Wrench, CheckCircle2, ArrowRight, Server, RefreshCw } from 'lucide-react';
import { RepairTask } from '../types/cluster';
import { StorageNode } from '../types/node';
import { ProgressBar } from './ProgressBar';

interface RepairQueueViewProps {
  tasks: RepairTask[];
  nodes: StorageNode[];
}

export const RepairQueueView: React.FC<RepairQueueViewProps> = ({ tasks, nodes }) => {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  if (tasks.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Replica Quorum Stable — No Active Repair Tasks</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Cluster health monitors constantly scan for under-replicated or corrupted partitions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => {
        const sourceNode = nodeMap.get(task.sourceNodeId);
        const targetNode = nodeMap.get(task.targetNodeId);
        const isComplete = task.status === 'COMPLETED';

        return (
          <div
            key={task.id}
            className={`p-3.5 rounded-xl border transition-all ${
              isComplete
                ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-300'
                : 'bg-cyan-950/30 border-cyan-800/60 text-cyan-100 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                )}
                <span className="font-mono font-semibold text-white">
                  {isComplete ? 'Restored:' : 'Reconstructing:'} {task.filename}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {task.reason.replace('_', ' ')}
                </span>
              </div>

              <span className="font-mono text-xs font-bold text-cyan-400">
                {task.progress}%
              </span>
            </div>

            {/* Source to Target Nodes Flow */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 my-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Source: {sourceNode ? sourceNode.name : task.sourceNodeId}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <div className="flex items-center gap-1.5 text-slate-300">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target: {targetNode ? targetNode.name : task.targetNodeId}</span>
              </div>
            </div>

            {/* Progress */}
            <ProgressBar
              value={task.progress}
              color={isComplete ? 'emerald' : 'cyan'}
              size="sm"
            />
          </div>
        );
      })}
    </div>
  );
};
