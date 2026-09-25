import React, { useState } from 'react';
import {
  Upload,
  Search,
  Filter,
  Eye,
  Download,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  FileText,
} from 'lucide-react';
import { StoredObject } from '../types/object';
import { StorageNode } from '../types/node';
import { StatusBadge } from '../components/StatusBadge';
import { formatBytes, formatTimeAgo } from '../services/cryptoService';

interface ObjectsPageProps {
  objects: StoredObject[];
  nodes: StorageNode[];
  onOpenUpload: () => void;
  onInspectObject: (object: StoredObject) => void;
  onDownload: (objectId: string) => void;
  onVerify: (objectId: string) => void;
}

export const ObjectsPage: React.FC<ObjectsPageProps> = ({
  objects,
  nodes,
  onOpenUpload,
  onInspectObject,
  onDownload,
  onVerify,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const filteredObjects = objects.filter(obj => {
    const matchesSearch = obj.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.objectId.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'HEALTHY') return obj.status === 'HEALTHY';
    if (statusFilter === 'DEGRADED') return obj.status === 'REPAIR_REQUIRED' || obj.status === 'DEGRADED';
    if (statusFilter === 'CORRUPTED') return obj.status === 'CORRUPTED';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <span>Stored Objects</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {objects.length} total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Distributed files with replica distribution across independent storage nodes
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg shadow-md shadow-cyan-950 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Object</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename or object ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-500 font-medium text-[11px] uppercase mr-1">Status:</span>
          {['ALL', 'HEALTHY', 'DEGRADED', 'CORRUPTED'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === filter
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Objects Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
            <tr>
              <th className="py-3 px-4">Name / ID</th>
              <th className="py-3 px-3">Size</th>
              <th className="py-3 px-3">Version</th>
              <th className="py-3 px-3">Replication</th>
              <th className="py-3 px-3">Replica Nodes</th>
              <th className="py-3 px-3">Health Status</th>
              <th className="py-3 px-3">Last Verified</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredObjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  No objects matched your search criteria.
                </td>
              </tr>
            ) : (
              filteredObjects.map(obj => {
                const healthyReplicas = obj.replicas.filter(r => {
                  const node = nodeMap.get(r.nodeId);
                  return node && node.status === 'HEALTHY' && r.status === 'HEALTHY' && !r.isCorrupted;
                }).length;

                return (
                  <tr
                    key={obj.objectId}
                    onClick={() => onInspectObject(obj)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Name & ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/80 text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-white block group-hover:text-cyan-300 transition-colors font-mono">
                            {obj.filename}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {obj.objectId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {formatBytes(obj.size)}
                    </td>

                    {/* Version */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        v{obj.version}
                      </span>
                    </td>

                    {/* Replication Factor */}
                    <td className="py-3 px-3 font-mono">
                      <span
                        className={`font-semibold ${
                          healthyReplicas >= obj.replicationFactor
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {healthyReplicas}/{obj.replicationFactor}
                      </span>
                    </td>

                    {/* Replica Nodes Chips */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {obj.replicas.map(r => {
                          const node = nodeMap.get(r.nodeId);
                          const isOnline = node && node.status === 'HEALTHY';
                          const isCorrupted = r.status === 'CORRUPTED' || r.isCorrupted;
                          const isStale = r.status === 'STALE';

                          let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
                          if (!isOnline) {
                            badgeColor = 'bg-rose-950/70 text-rose-400 border-rose-800';
                          } else if (isCorrupted) {
                            badgeColor = 'bg-rose-950/90 text-rose-300 border-rose-700';
                          } else if (isStale) {
                            badgeColor = 'bg-amber-950 text-amber-300 border-amber-800';
                          } else {
                            badgeColor = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
                          }

                          return (
                            <span
                              key={r.nodeId}
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeColor}`}
                              title={`${node ? node.name : r.nodeId} - ${r.status}`}
                            >
                              {node ? node.id.replace('node-', 'N') : r.nodeId}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Health Status */}
                    <td className="py-3 px-3">
                      <StatusBadge status={obj.status} size="sm" />
                    </td>

                    {/* Last Verified */}
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {obj.lastVerifiedAt ? formatTimeAgo(obj.lastVerifiedAt) : 'Never'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onInspectObject(obj)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                          title="View Object Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDownload(obj.objectId)}
                          className="p-1.5 text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/70 rounded-md transition-colors"
                          title="Download from Healthy Replica"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
