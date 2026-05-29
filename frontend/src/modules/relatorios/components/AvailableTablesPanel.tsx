import { ChevronDown, ChevronRight, PlusCircle, Search } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import type { ReportTableMetadata } from '../types/reportBuilder.types';

interface AvailableTablesPanelProps {
  tables: ReportTableMetadata[];
  categoryLabels: Record<string, string>;
  selectedTableIds: string[];
  onToggleTable: (tableId: string) => void;
}

export const AvailableTablesPanel = memo(function AvailableTablesPanel({
  tables,
  categoryLabels,
  selectedTableIds,
  onToggleTable
}: AvailableTablesPanelProps) {
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const selectedSet = new Set(selectedTableIds);

  const groupedTables = useMemo(() => {
    const byCategory = new Map<string, ReportTableMetadata[]>();
    const normalizedSearch = search.trim().toLowerCase();

    for (const table of tables) {
      const target = `${table.name} ${table.description}`.toLowerCase();
      if (normalizedSearch && !target.includes(normalizedSearch)) {
        continue;
      }

      const categoryId = table.category ?? 'outros';
      const current = byCategory.get(categoryId) ?? [];
      current.push(table);
      byCategory.set(categoryId, current);
    }

    return Array.from(byCategory.entries()).map(([categoryId, items]) => ({
      categoryId,
      label: categoryLabels[categoryId] ?? categoryId,
      tables: items
    }));
  }, [categoryLabels, search, tables]);

  function isExpanded(categoryId: string) {
    if (categoryId in expandedGroups) {
      return expandedGroups[categoryId];
    }
    return true;
  }

  function toggleGroup(categoryId: string) {
    setExpandedGroups((current) => ({
      ...current,
      [categoryId]: !isExpanded(categoryId)
    }));
  }

  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Tabelas disponiveis</h3>
        <p className="mt-1 text-xs text-slate-600">Escolha as tabelas que faram parte do relatorio.</p>
      </div>

      <label className="relative block">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          className="form-input h-10 pl-9"
          placeholder="Buscar tabela"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
        {selectedTableIds.length} tabela(s) selecionada(s)
      </div>

      <div className="space-y-2">
        {groupedTables.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Nenhuma tabela encontrada para o termo informado.
          </p>
        ) : (
          groupedTables.map((group) => {
            const expanded = isExpanded(group.categoryId);
            return (
              <div key={group.categoryId} className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-1.5 py-1.5 text-left transition hover:bg-slate-50"
                  onClick={() => toggleGroup(group.categoryId)}
                  title={expanded ? 'Recolher categoria' : 'Expandir categoria'}
                >
                  <span className="text-[12px] font-semibold text-slate-800">
                    {group.label} ({group.tables.length})
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                    {expanded ? 'Recolher' : 'Expandir'}
                    {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </span>
                </button>

                {!expanded ? null : (
                  <div className="mt-2 space-y-2">
                    {group.tables.map((table) => {
                      const selected = selectedSet.has(table.id);
                      return (
                        <label
                          key={table.id}
                          className={`block cursor-pointer rounded-lg border px-2.5 py-2 transition ${
                            selected
                              ? 'border-cyan-300 bg-cyan-50/70 ring-1 ring-cyan-100'
                              : 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/30'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
                              checked={selected}
                              onChange={() => onToggleTable(table.id)}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-[13px] font-semibold text-slate-800">{table.name}</p>
                                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">
                                  {table.fields.length} campos
                                </span>
                              </div>
                              <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{table.description}</p>
                              <p className="mt-1 text-[11px] font-medium text-slate-600">
                                {selected ? 'Selecionada para o relatorio' : 'Nao selecionada'}
                              </p>
                            </div>
                            <PlusCircle size={15} className={selected ? 'text-cyan-600' : 'text-slate-400'} />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </article>
  );
});
