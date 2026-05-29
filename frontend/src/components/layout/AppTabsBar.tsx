import { X, XCircle } from 'lucide-react';
import type { AppTab } from '../../app/tabs';

interface AppTabsBarProps {
  tabs: AppTab[];
  activePath: string;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  onCloseAll: () => void;
}

export function AppTabsBar({ tabs, activePath, onSelect, onClose, onCloseAll }: AppTabsBarProps) {
  const closableCount = tabs.filter((tab) => tab.closable).length;
  const canCloseAll = closableCount > 0;

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex items-end justify-between gap-3 px-3 pt-2 sm:px-6">
        <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto">
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

        <button
          type="button"
          className="mb-0.5 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          title={canCloseAll ? 'Fechar todas as abas abertas' : 'Nao ha abas abertas para fechar'}
          aria-label="Fechar todas as abas abertas"
          onClick={onCloseAll}
          disabled={!canCloseAll}
        >
          <XCircle size={14} />
          <span className="hidden sm:inline">Fechar abas</span>
        </button>
      </div>
    </div>
  );
}
