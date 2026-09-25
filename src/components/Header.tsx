import React from 'react';
import { Database, ShieldAlert, Cpu, CheckCircle2, RotateCcw, Play, Activity, SlidersHorizontal, Sparkles } from 'lucide-react';
import { ClusterStats } from '../types/cluster';

interface HeaderProps {
  stats: ClusterStats;
  autoRepair: boolean;
  onToggleAutoRepair: (enabled: boolean) => void;
  onSimulateNodeFailure: () => void;
  onSimulateCorruption: () => void;
  onVerifyAll: () => void;
  onRepairAll: () => void;
  onRebalance: () => void;
  onReset: () => void;
  onOpenDemoTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  autoRepair,
  onToggleAutoRepair,
  onSimulateNodeFailure,
  onSimulateCorruption,
  onVerifyAll,
  onRepairAll,
  onRebalance,
  onReset,
  onOpenDemoTour,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Database className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                  Aritra's Vault
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700/80 font-medium">
                  v1.2-distributed
                </span>
                
                {/* Cluster Health Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-inner transition-colors duration-200"
                  style={{
                    backgroundColor: stats.clusterHealth === 'HEALTHY' ? 'rgba(6, 78, 59, 0.4)' : stats.clusterHealth === 'DEGRADED' ? 'rgba(120, 53, 15, 0.4)' : 'rgba(127, 29, 29, 0.4)',
                    borderColor: stats.clusterHealth === 'HEALTHY' ? 'rgba(16, 185, 129, 0.4)' : stats.clusterHealth === 'DEGRADED' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                    color: stats.clusterHealth === 'HEALTHY' ? '#34d399' : stats.clusterHealth === 'DEGRADED' ? '#fbbf24' : '#f87171'
                  }}
                >
                  <span className={`w-2 h-2 rounded-full ${stats.clusterHealth === 'HEALTHY' ? 'bg-emerald-400' : stats.clusterHealth === 'DEGRADED' ? 'bg-amber-400' : 'bg-rose-500 animate-ping'}`} />
                  <span>{stats.clusterHealth === 'HEALTHY' ? 'HEALTHY' : stats.clusterHealth === 'DEGRADED' ? 'DEGRADED' : 'CRITICAL'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Fault-Tolerant Distributed Object Storage & Consensus Engine
              </p>
            </div>
          </div>

          {/* Right Actions: Auto-repair toggle & Guided Demo Walkthrough trigger */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Auto-healing toggle */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/70 text-xs">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300 font-medium">Autonomous Self-Healing</span>
              <button
                type="button"
                onClick={() => onToggleAutoRepair(!autoRepair)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoRepair ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
                title="When enabled, cluster repairs under-replicated or corrupted replicas automatically"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoRepair ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Guided Demo Tour Button */}
            <button
              onClick={onOpenDemoTour}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-900/30 transition-all border border-cyan-400/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
              <span>13-Step Demo Scenario</span>
            </button>

            {/* Reset button */}
            <button
              onClick={onReset}
              title="Reset cluster to pristine default state"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Demo Controls Toolbar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-300">Demo Controls:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={onSimulateNodeFailure}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Simulate Node Failure</span>
            </button>

            <button
              onClick={onSimulateCorruption}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 border border-amber-800/60 transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3 h-3 text-amber-400" />
              <span>Simulate Corruption</span>
            </button>

            <button
              onClick={onVerifyAll}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verify All</span>
            </button>

            <button
              onClick={onRepairAll}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 text-cyan-400" />
              <span>Repair All</span>
            </button>

            <button
              onClick={onRebalance}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/60 transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3 h-3 text-indigo-400" />
              <span>Rebalance Cluster</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
