import type { ReportFieldOption, ReportTableOption } from '../types/reportBuilder.types';

interface FieldSelectorProps {
  selectedTableIds: string[];
  tables: ReportTableOption[];
  fieldsByTable: Record<string, ReportFieldOption[]>;
  selectedFieldKeys: string[];
  onToggleField: (fieldKey: string) => void;
}

export function FieldSelector({
  selectedTableIds,
  tables,
  fieldsByTable,
  selectedFieldKeys,
  onToggleField
}: FieldSelectorProps) {
  const selectedFieldSet = new Set(selectedFieldKeys);
  const tableMap = new Map(tables.map((table) => [table.id, table.label]));

  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">2. Escolha os campos</h3>
        <p className="mt-1 text-sm text-slate-600">Defina os campos que devem aparecer no relatório.</p>
      </div>

      {selectedTableIds.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Selecione ao menos uma tabela para visualizar os campos disponíveis.
        </p>
      ) : (
        <div className="space-y-4">
          {selectedTableIds.map((tableId) => {
            const fields = fieldsByTable[tableId] ?? [];
            const tableLabel = tableMap.get(tableId) ?? tableId;

            return (
              <section key={tableId} className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
                <h4 className="text-sm font-semibold text-slate-800">{tableLabel}</h4>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {fields.map((field) => {
                    const fieldKey = `${tableId}.${field.id}`;
                    return (
                      <label
                        key={fieldKey}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
                          checked={selectedFieldSet.has(fieldKey)}
                          onChange={() => onToggleField(fieldKey)}
                        />
                        <span>{field.label}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </article>
  );
}
