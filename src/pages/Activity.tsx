import React, { useState } from 'react';
import { ListFilter, Download, Search, RefreshCw, Trash2 } from 'lucide-react';
import { ActivityEvent } from '../types/activity';
import { ActivityFeed } from '../components/ActivityFeed';

interface ActivityPageProps {
  activities: ActivityEvent[];
}

export const ActivityPage: React.FC<ActivityPageProps> = ({ activities }) => {
  const [search, setSearch] = useState<string>('');

  const filtered = activities.filter(
    a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vault_cluster_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <span>Cluster Activity & Audit Log</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {activities.length} Events Recorded
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable chronological record of node heartbeats, failure detections, checksum scrubbers, and replica repairs
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail (JSON)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search event logs by title, description or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <ActivityFeed activities={filtered} showFilters={true} />
      </div>
    </div>
  );
};
