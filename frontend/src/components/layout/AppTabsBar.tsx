import { X } from 'lucide-react';
import type { AppTab } from '../../app/tabs';

interface AppTabsBarProps {
  tabs: AppTab[];
  activePath: string;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
}

export function AppTabsBar({ tabs, activePath, onSelect, onClose }: AppTabsBarProps) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex items-end gap-1 overflow-x-auto px-3 pt-2 sm:px-6">
        {tabs.map((tab) => {
          const isActive = tab.path === activePath;
          return (
            <div
              key={tab.path}
              className={`group flex min-w-[160px] max-w-[260px] items-center justify-between rounded-t-lg border px-3 py-2 text-sm transition ${
                isActive
                  ? 'border-slate-300 border-b-white bg-white text-sindata-900'
                  : 'border-transparent bg-slate-100/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <button
                type="button"
                className="truncate text-left font-medium"
                onClick={() => onSelect(tab.path)}
                title={tab.label}
              >
                {tab.label}
              </button>

              {tab.closable ? (
                <button
                  type="button"
                  className={`ml-2 inline-flex h-5 w-5 items-center justify-center rounded transition ${
                    isActive ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                  }`}
                  onClick={() => onClose(tab.path)}
                  aria-label={`Fechar aba ${tab.label}`}
                >
                  <X size={13} />
                </button>
              ) : (
                <span className="ml-2 inline-block h-5 w-5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
