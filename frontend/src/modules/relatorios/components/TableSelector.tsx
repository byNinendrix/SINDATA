import type { ReportTableOption } from '../types/reportBuilder.types';

interface TableSelectorProps {
  tables: ReportTableOption[];
  selectedTableIds: string[];
  onToggleTable: (tableId: string) => void;
}

export function TableSelector({ tables, selectedTableIds, onToggleTable }: TableSelectorProps) {
  const selectedSet = new Set(selectedTableIds);

  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">1. Escolha as tabelas</h3>
        <p className="mt-1 text-sm text-slate-600">
          Selecione as fontes de dados que você quer usar no relatório.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => {
          const checked = selectedSet.has(table.id);
          return (
            <label
              key={table.id}
              className={`cursor-pointer rounded-xl border p-3 transition ${
                checked ? 'border-cyan-300 bg-cyan-50/40' : 'border-slate-200 bg-white hover:border-cyan-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
                  checked={checked}
                  onChange={() => onToggleTable(table.id)}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{table.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{table.description}</p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </article>
  );
}
