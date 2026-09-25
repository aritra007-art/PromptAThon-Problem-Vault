import React from 'react';
import { LayoutDashboard, HardDrive, Server, ListFilter, Sparkles } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'objects' | 'nodes' | 'activity' | 'demotour';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  objectCount: number;
  nodeCount: number;
  healthyNodeCount: number;
  repairCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  objectCount,
  nodeCount,
  healthyNodeCount,
  repairCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: repairCount > 0 ? `${repairCount} repairs` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'objects' as ActiveTab,
      label: 'Objects',
      icon: HardDrive,
      badge: `${objectCount}`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'nodes' as ActiveTab,
      label: 'Storage Nodes',
      icon: Server,
      badge: `${healthyNodeCount}/${nodeCount}`,
      badgeColor: healthyNodeCount === nodeCount ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'activity' as ActiveTab,
      label: 'Activity Log',
      icon: ListFilter,
    },
    {
      id: 'demotour' as ActiveTab,
      label: 'Demo Walkthrough',
      icon: Sparkles,
      badge: 'Interactive',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse',
    },
  ];

  return (
    <nav className="border-b border-slate-800/90 bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[11px] font-mono px-2 py-0.5 rounded-full border ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
