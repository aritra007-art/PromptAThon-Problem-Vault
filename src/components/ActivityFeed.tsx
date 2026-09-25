import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Filter,
  FileCheck2,
  HardDrive,
  RotateCw,
} from 'lucide-react';
import { ActivityEvent, EventType } from '../types/activity';
import { formatTimeAgo } from '../services/cryptoService';

interface ActivityFeedProps {
  activities: ActivityEvent[];
  maxItems?: number;
  showFilters?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems,
  showFilters = false,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = activities.filter(evt => {
    if (filterType === 'ALL') return true;
    if (filterType === 'FAILURES') return evt.type.includes('FAILURE') || evt.severity === 'error';
    if (filterType === 'REPAIRS') return evt.type.includes('REPAIR') || evt.type.includes('RECOVERY');
    if (filterType === 'INTEGRITY') return evt.type.includes('INTEGRITY') || evt.type.includes('CORRUPTION');
    if (filterType === 'UPLOADS') return evt.type.includes('OBJECT_') || evt.type.includes('REPLICATION');
    return true;
  });

  const displayItems = maxItems ? filtered.slice(0, maxItems) : filtered;

  const getIcon = (evt: ActivityEvent) => {
    switch (evt.severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  const getSeverityBg = (severity: ActivityEvent['severity']) => {
    switch (severity) {
      case 'error':
        return 'border-rose-900/40 bg-rose-950/20';
      case 'warning':
        return 'border-amber-900/40 bg-amber-950/20';
      case 'success':
        return 'border-emerald-900/40 bg-emerald-950/20';
      default:
        return 'border-slate-800 bg-slate-900/40';
    }
  };

  return (
    <div className="space-y-3">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {['ALL', 'FAILURES', 'REPAIRS', 'INTEGRITY', 'UPLOADS'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/80'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-900/40 border border-slate-800">
          No activity logs recorded under this filter.
        </div>
      ) : (
        <div className="space-y-2">
          {displayItems.map(event => {
            const timeFormatted = new Date(event.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={event.id}
                className={`p-3 rounded-xl border text-xs transition-all ${getSeverityBg(event.severity)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{getIcon(event)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 font-sans">{event.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {event.type}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 leading-relaxed font-sans">{event.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] text-slate-400 block">{timeFormatted}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">{formatTimeAgo(event.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
