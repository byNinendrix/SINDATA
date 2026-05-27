import type { ReportRelationOption, ReportTableOption } from '../types/reportBuilder.types';

interface RelationPreviewProps {
  selectedTableIds: string[];
  tables: ReportTableOption[];
  relations: ReportRelationOption[];
}

export function RelationPreview({ selectedTableIds, tables, relations }: RelationPreviewProps) {
  const tableMap = new Map(tables.map((table) => [table.id, table.label]));
  const selectedLabels = selectedTableIds.map((tableId) => tableMap.get(tableId) ?? tableId);
  const selectedSet = new Set(selectedTableIds);

  const relationSuggestions = relations.filter((relation) => {
    const fromTable = relation.fromTableId ?? relation.fromTable ?? '';
    const toTable = relation.toTableId ?? relation.toTable ?? '';
    return selectedSet.has(fromTable) && selectedSet.has(toTable);
  });

  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">3. Ligacoes entre tabelas</h3>
        <p className="mt-1 text-sm text-slate-600">
          Visualizacao inicial para orientar como as tabelas selecionadas podem se conectar.
        </p>
      </div>

      {selectedTableIds.length < 2 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Selecione pelo menos duas tabelas para visualizar uma sugestao de ligacao.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 px-4 py-3 text-sm text-cyan-900">
            {selectedLabels.join(' -> ')}
          </div>

          {relationSuggestions.length > 0 ? (
            <div className="space-y-2">
              {relationSuggestions.map((relation) => {
                const fromTable = relation.fromTableId ?? relation.fromTable ?? '';
                const toTable = relation.toTableId ?? relation.toTable ?? '';
                return (
                  <div
                    key={`${fromTable}-${toTable}`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                  >
                    <span className="font-semibold">{tableMap.get(fromTable) ?? fromTable}</span>{' -> '}
                    <span className="font-semibold">{tableMap.get(toTable) ?? toTable}</span>: {relation.label}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Nenhuma sugestao especifica encontrada para esta combinacao nesta etapa inicial.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
