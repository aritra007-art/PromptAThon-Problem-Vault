import React from 'react';
import {
  HardDrive,
  Database,
  Layers,
  ShieldCheck,
  Server,
  Activity,
  Wrench,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { StorageNode } from '../types/node';
import { StoredObject } from '../types/object';
import { ActivityEvent } from '../types/activity';
import { ClusterStats, RepairTask } from '../types/cluster';
import { NodeCard } from '../components/NodeCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { RepairQueueView } from '../components/RepairQueueView';
import { formatBytes } from '../services/cryptoService';
import { ActiveTab } from '../components/Navigation';

interface DashboardProps {
  stats: ClusterStats;
  nodes: StorageNode[];
  objects: StoredObject[];
  activities: ActivityEvent[];
  repairQueue: RepairTask[];
  onSimulateNodeFailure: (nodeId: string) => void;
  onRecoverNode: (nodeId: string) => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  nodes,
  objects,
  activities,
  repairQueue,
  onSimulateNodeFailure,
  onRecoverNode,
  onSelectTab,
  onOpenUpload,
}) => {
  const activeRepairTasks = repairQueue.filter(t => t.status !== 'COMPLETED');
  const usedStoragePercentage = Math.round(
    (stats.usedStorageBytes / stats.totalStorageBytes) * 100
  );

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Storage */}
        <div className="p-4.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Storage</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {formatBytes(stats.totalStorageBytes, 0)}
            </span>
            <span className="text-xs text-slate-500 font-mono">Capacity</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Aggregated across {stats.totalNodesCount} distributed storage nodes
          </p>
        </div>

        {/* Card 2: Used Storage */}
        <div className="p-4.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Used Storage</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {formatBytes(stats.usedStorageBytes)}
            </span>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              {usedStoragePercentage}% Allocated
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Replicated partitions & consensus journal logs
          </p>
        </div>

        {/* Card 3: Objects Ingested */}
        <div className="p-4.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Objects</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats.totalObjects}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-medium">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Cryptographically sealed</span>
            <button
              onClick={onOpenUpload}
              className="text-cyan-400 hover:underline text-[11px] font-semibold"
            >
              + Upload
            </button>
          </p>
        </div>

        {/* Card 4: Healthy Replicas */}
        <div className="p-4.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Healthy Replicas</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats.healthyReplicasCount} / {stats.totalExpectedReplicas}
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                stats.healthyReplicasCount === stats.totalExpectedReplicas
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {stats.healthyReplicasCount === stats.totalExpectedReplicas ? '100% Quorum' : 'Degraded Quorum'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Redundant copies distributed across nodes
          </p>
        </div>
      </div>

      {/* Storage Nodes Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Storage Nodes Cluster
            </h2>
            <span className="text-xs font-mono text-slate-400">
              ({stats.healthyNodesCount}/{stats.totalNodesCount} Healthy)
            </span>
          </div>

          <button
            onClick={() => onSelectTab('nodes')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Node Topology Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nodes.map(node => (
            <NodeCard
              key={node.id}
              node={node}
              onSimulateFailure={onSimulateNodeFailure}
              onRecover={onRecoverNode}
              onViewObjects={() => onSelectTab('objects')}
            />
          ))}
        </div>
      </div>

      {/* Two Column Layout: Repair Queue & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Repair Queue */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Self-Healing & Repair Queue
              </h2>
            </div>
            {activeRepairTasks.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse">
                {activeRepairTasks.length} Active
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Automated background reconstruction jobs streaming replicas to restore quorum durability.
          </p>

          <RepairQueueView tasks={repairQueue.slice(0, 3)} nodes={nodes} />
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Live Activity Stream
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('activity')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Full Audit Trail</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Real-time consensus events, node health transitions, and cryptographic verification logs.
          </p>

          <ActivityFeed activities={activities} maxItems={4} />
        </div>
      </div>
    </div>
  );
};
