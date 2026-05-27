import { PlusCircle } from 'lucide-react';
import type { ReportTableMetadata } from '../types/reportBuilder.types';

interface AvailableTablesPanelProps {
  tables: ReportTableMetadata[];
  selectedTableIds: string[];
  onToggleTable: (tableId: string) => void;
}

export function AvailableTablesPanel({ tables, selectedTableIds, onToggleTable }: AvailableTablesPanelProps) {
  const selectedSet = new Set(selectedTableIds);

  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Tabelas disponiveis</h3>
        <p className="mt-1 text-xs text-slate-600">Adicione tabelas para montar o modelo do relatorio.</p>
      </div>

      <div className="space-y-2">
        {tables.map((table) => {
          const selected = selectedSet.has(table.id);
          return (
            <label
              key={table.id}
              className={`block cursor-pointer rounded-xl border p-3 transition ${
                selected ? 'border-cyan-300 bg-cyan-50/50' : 'border-slate-200 bg-white hover:border-cyan-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
                  checked={selected}
                  onChange={() => onToggleTable(table.id)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">{table.name}</p>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">
                      {table.fields.length} campos
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{table.description}</p>
                </div>
                <PlusCircle size={15} className={selected ? 'text-cyan-600' : 'text-slate-400'} />
              </div>
            </label>
          );
        })}
      </div>
    </article>
  );
}
