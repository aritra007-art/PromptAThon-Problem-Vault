import React, { useState } from 'react';
import {
  X,
  Download,
  ShieldCheck,
  Wrench,
  Bug,
  Clock,
  Copy,
  Check,
  Server,
  FileCheck2,
  AlertTriangle,
  History,
  Trash2,
} from 'lucide-react';
import { StoredObject } from '../types/object';
import { StorageNode } from '../types/node';
import { StatusBadge } from './StatusBadge';
import { formatBytes, formatTimeAgo } from '../services/cryptoService';
import { VerificationResult } from '../services/integrityService';

interface ObjectDetailsModalProps {
  object: StoredObject | null;
  nodes: StorageNode[];
  onClose: () => void;
  onDownload: (objectId: string) => void;
  onVerify: (objectId: string) => Promise<VerificationResult[]>;
  onRepair: (objectId: string) => Promise<boolean>;
  onCorrupt: (objectId: string, nodeId: string) => void;
  onStale: (objectId: string, nodeId: string) => void;
  onDelete: (objectId: string) => void;
}

export const ObjectDetailsModal: React.FC<ObjectDetailsModalProps> = ({
  object,
  nodes,
  onClose,
  onDownload,
  onVerify,
  onRepair,
  onCorrupt,
  onStale,
  onDelete,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  if (!object) return null;

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(object.checksum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationFeedback(null);
    try {
      const results = await onVerify(object.objectId);
      const res = results[0];
      if (res) {
        if (res.corruptedReplicas > 0) {
          setVerificationFeedback(`❌ Checksum mismatch detected on ${res.corruptedReplicas} replica(s)!`);
        } else if (res.staleReplicas > 0) {
          setVerificationFeedback(`⚠ Stale version detected on ${res.staleReplicas} replica(s)!`);
        } else {
          setVerificationFeedback(`✓ All ${res.healthyReplicas} active replicas successfully verified against SHA-256 hash.`);
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRepair = async () => {
    setIsRepairing(true);
    try {
      await onRepair(object.objectId);
    } finally {
      setIsRepairing(false);
    }
  };

  const healthyReplicaCount = object.replicas.filter(r => {
    const node = nodeMap.get(r.nodeId);
    return node && node.status === 'HEALTHY' && r.status === 'HEALTHY' && !r.isCorrupted;
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-white font-mono truncate max-w-md">
                {object.filename}
              </h2>
              <StatusBadge status={object.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Object ID: <span className="font-mono text-slate-300">{object.objectId}</span></span>
              <span>•</span>
              <span>Version: <span className="font-mono text-cyan-400 font-semibold">v{object.version}</span></span>
              <span>•</span>
              <span>Replication: <span className="font-mono text-slate-200 font-medium">{healthyReplicaCount}/{object.replicationFactor} Quorum</span></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Key-Value Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] uppercase font-semibold text-slate-400">File Size</span>
            <p className="text-sm font-bold text-white font-mono mt-0.5">{formatBytes(object.size)}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] uppercase font-semibold text-slate-400">Configured Factor</span>
            <p className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{object.replicationFactor} Replicas</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] uppercase font-semibold text-slate-400">Uploaded At</span>
            <p className="text-xs text-slate-300 mt-0.5">{formatTimeAgo(object.uploadedAt)}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] uppercase font-semibold text-slate-400">Last Verified</span>
            <p className="text-xs text-slate-300 mt-0.5">
              {object.lastVerifiedAt ? formatTimeAgo(object.lastVerifiedAt) : 'Never'}
            </p>
          </div>
        </div>

        {/* Canonical Checksum */}
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 mb-5">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Canonical SHA-256 Checksum (Source of Truth)
            </span>
            <p className="font-mono text-xs text-cyan-300 truncate mt-0.5 select-all">
              {object.checksum}
            </p>
          </div>
          <button
            onClick={handleCopyChecksum}
            className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1"
            title="Copy checksum"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Verification Result Notification */}
        {verificationFeedback && (
          <div className={`p-3 rounded-lg mb-4 text-xs font-medium border ${
            verificationFeedback.startsWith('❌')
              ? 'bg-rose-950/70 text-rose-300 border-rose-800'
              : verificationFeedback.startsWith('⚠')
              ? 'bg-amber-950/70 text-amber-300 border-amber-800'
              : 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
          }`}>
            {verificationFeedback}
          </div>
        )}

        {/* Replica Distribution Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Distributed Storage Nodes & Replica Quorum
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Target: {object.replicationFactor} nodes
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Storage Node</th>
                  <th className="py-2.5 px-3">Node Status</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Stored Checksum</th>
                  <th className="py-2.5 px-3 text-center">Integrity</th>
                  <th className="py-2.5 px-3 text-right">Fault Simulation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {object.replicas.map(replica => {
                  const node = nodeMap.get(replica.nodeId);
                  const nodeName = node ? node.name : replica.nodeId;
                  const isNodeOnline = node && node.status === 'HEALTHY';
                  const isCorrupted = replica.status === 'CORRUPTED' || replica.isCorrupted;
                  const isStale = replica.version < object.version || replica.status === 'STALE';

                  return (
                    <tr key={replica.nodeId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {nodeName}
                      </td>

                      <td className="py-2.5 px-3">
                        {isNodeOnline ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Offline
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${isStale ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-300'}`}>
                          v{replica.version}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-[11px] max-w-[140px] truncate text-slate-400" title={replica.storedChecksum}>
                        {isNodeOnline ? (
                          <span className={isCorrupted ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                            {replica.storedChecksum.slice(0, 10)}...{replica.storedChecksum.slice(-6)}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">--- Unreachable ---</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {!isNodeOnline ? (
                          <span className="text-slate-500 font-bold">—</span>
                        ) : isCorrupted ? (
                          <span className="text-rose-400 font-bold flex items-center justify-center gap-1 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            MISMATCH
                          </span>
                        ) : isStale ? (
                          <span className="text-amber-400 font-bold flex items-center justify-center gap-1 text-[11px]">
                            <History className="w-3.5 h-3.5" />
                            STALE
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold flex items-center justify-center gap-1 text-[11px]">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            MATCHED
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {isNodeOnline && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onCorrupt(object.objectId, replica.nodeId)}
                              className="px-2 py-0.5 text-[10px] rounded bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-800/80 transition-colors"
                              title="Flip bytes to simulate data corruption"
                            >
                              Corrupt
                            </button>
                            <button
                              onClick={() => onStale(object.objectId, replica.nodeId)}
                              className="px-2 py-0.5 text-[10px] rounded bg-amber-950/70 hover:bg-amber-900/90 text-amber-300 border border-amber-800/80 transition-colors"
                              title="Simulate outdated version"
                            >
                              Make Stale
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-800">
          <button
            onClick={() => {
              if (confirm(`Delete ${object.filename} from Vault?`)) {
                onDelete(object.objectId);
                onClose();
              }
            }}
            className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Object</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <ShieldCheck className={`w-3.5 h-3.5 text-cyan-400 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Integrity'}</span>
            </button>

            <button
              onClick={handleRepair}
              disabled={isRepairing || healthyReplicaCount === 0}
              className="px-3 py-2 text-xs font-semibold text-cyan-200 bg-cyan-950 hover:bg-cyan-900/80 border border-cyan-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Wrench className={`w-3.5 h-3.5 text-cyan-400 ${isRepairing ? 'animate-spin' : ''}`} />
              <span>{isRepairing ? 'Repairing Quorum...' : 'Repair Replicas'}</span>
            </button>

            <button
              onClick={() => onDownload(object.objectId)}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg shadow-md shadow-cyan-950 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
