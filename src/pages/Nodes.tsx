import React, { useState } from 'react';
import {
  Server,
  Activity,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  Cpu,
  Wifi,
  Layers,
  Database,
} from 'lucide-react';
import { StorageNode } from '../types/node';
import { StoredObject } from '../types/object';
import { NodeCard } from '../components/NodeCard';
import { ProgressBar } from '../components/ProgressBar';
import { formatBytes } from '../services/cryptoService';

interface NodesPageProps {
  nodes: StorageNode[];
  objects: StoredObject[];
  onSimulateNodeFailure: (nodeId: string) => void;
  onRecoverNode: (nodeId: string) => void;
  onInspectObject: (object: StoredObject) => void;
}

export const NodesPage: React.FC<NodesPageProps> = ({
  nodes,
  objects,
  onSimulateNodeFailure,
  onRecoverNode,
  onInspectObject,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const hostedObjects = selectedNode
    ? objects.filter(obj => obj.replicas.some(r => r.nodeId === selectedNode.id))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <span>Storage Nodes Topology</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {nodes.filter(n => n.status === 'HEALTHY').length}/{nodes.length} Nodes Active
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Independent storage daemons handling replication streams, disk I/O, and consensus heartbeats
          </p>
        </div>
      </div>

      {/* Cluster Storage Balance Visualizer */}
      <div className="p-4.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Cluster Storage Distribution & Utilization
          </span>
          <span className="text-slate-400 font-mono">
            4 Nodes Active in Quorum
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {nodes.map(node => {
            const usagePct = Math.round((node.usedBytes / node.capacityBytes) * 100);
            const isOnline = node.status === 'HEALTHY';

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedNodeId === node.id
                    ? 'bg-cyan-950/40 border-cyan-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono mb-1.5">
                  <span className="font-semibold text-slate-200">{node.name}</span>
                  <span className={isOnline ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                    {usagePct}%
                  </span>
                </div>

                <ProgressBar
                  value={usagePct}
                  color={!isOnline ? 'rose' : usagePct > 80 ? 'amber' : 'cyan'}
                  size="sm"
                />

                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>{formatBytes(node.usedBytes)} used</span>
                  <span>{node.storedObjectIds.length} objs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage Nodes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map(node => (
          <NodeCard
            key={node.id}
            node={node}
            onSimulateFailure={onSimulateNodeFailure}
            onRecover={onRecoverNode}
            onViewObjects={nodeId => setSelectedNodeId(nodeId)}
          />
        ))}
      </div>

      {/* Hosted Objects Drawer / Deep Dive */}
      {selectedNode && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Objects Hosted on {selectedNode.name} ({hostedObjects.length})
              </h3>
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Drawer ✕
            </button>
          </div>

          {hostedObjects.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">No replicas currently residing on this node.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {hostedObjects.map(obj => {
                const replica = obj.replicas.find(r => r.nodeId === selectedNode.id);
                return (
                  <div
                    key={obj.objectId}
                    onClick={() => onInspectObject(obj)}
                    className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-white truncate max-w-[180px]">
                        {obj.filename}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                        v{replica?.version || obj.version}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{formatBytes(obj.size)}</span>
                      <span
                        className={
                          replica?.status === 'CORRUPTED'
                            ? 'text-rose-400 font-bold'
                            : replica?.status === 'STALE'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {replica?.status || 'HEALTHY'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
