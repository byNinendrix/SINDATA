import { Plus, Trash2 } from 'lucide-react';
import type { ReportFilterRule, ReportTableMetadata } from '../types/reportBuilder.types';

interface ReportFilterDraft {
  tableId: string;
  fieldId: string;
  condition: string;
  value: string;
  secondValue?: string;
}

interface ReportFiltersPanelProps {
  selectedTables: ReportTableMetadata[];
  conditions: string[];
  draft: ReportFilterDraft;
  filters: ReportFilterRule[];
  onDraftChange: (next: ReportFilterDraft) => void;
  onAddFilter: () => void;
  onRemoveFilter: (filterId: string) => void;
}

export function ReportFiltersPanel({
  selectedTables,
  conditions,
  draft,
  filters,
  onDraftChange,
  onAddFilter,
  onRemoveFilter
}: ReportFiltersPanelProps) {
  const selectedTable = selectedTables.find((table) => table.id === draft.tableId);
  const availableFields = selectedTable?.fields ?? [];
  const tableMap = new Map(selectedTables.map((table) => [table.id, table]));

  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Filtros</h3>
        <p className="mt-1 text-xs text-slate-600">Adicione filtros visuais para refinar os dados de retorno.</p>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
        <label className="form-label md:col-span-1">
          Tabela
          <select
            className="form-input mt-1"
            value={draft.tableId}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                tableId: event.target.value,
                fieldId: ''
              })
            }
          >
            <option value="">Selecione</option>
            {selectedTables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label md:col-span-1">
          Campo
          <select
            className="form-input mt-1"
            value={draft.fieldId}
            onChange={(event) => onDraftChange({ ...draft, fieldId: event.target.value })}
            disabled={!draft.tableId}
          >
            <option value="">Selecione</option>
            {availableFields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label md:col-span-1">
          Condicao
          <select
            className="form-input mt-1"
            value={draft.condition}
            onChange={(event) => onDraftChange({ ...draft, condition: event.target.value })}
          >
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label md:col-span-1">
          Valor
          <input
            type="text"
            className="form-input mt-1"
            value={draft.value}
            onChange={(event) => onDraftChange({ ...draft, value: event.target.value })}
            placeholder="Informe o valor"
          />
        </label>

        <label className="form-label md:col-span-1">
          {draft.condition === 'Entre' ? 'Valor final' : 'Complemento'}
          <input
            type="text"
            className="form-input mt-1"
            value={draft.secondValue ?? ''}
            onChange={(event) => onDraftChange({ ...draft, secondValue: event.target.value })}
            disabled={draft.condition !== 'Entre'}
            placeholder={draft.condition === 'Entre' ? 'Informe o valor final' : 'Opcional'}
          />
        </label>
      </div>

      <button type="button" className="btn-secondary gap-2 px-3 py-2 text-xs" onClick={onAddFilter}>
        <Plus size={14} />
        Adicionar filtro
      </button>

      {filters.length === 0 ? (
        <p className="text-sm text-slate-600">Nenhum filtro aplicado.</p>
      ) : (
        <div className="space-y-2">
          {filters.map((filter) => {
            const table = tableMap.get(filter.tableId);
            const field = table?.fields.find((item) => item.id === filter.fieldId);
            return (
              <div key={filter.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-xs text-slate-700">
                  <p className="font-semibold">{table?.name ?? filter.tableId}</p>
                  <p>
                    {field?.label ?? filter.fieldId} {filter.condition} {filter.value}
                    {filter.condition === 'Entre' && filter.secondValue ? ` e ${filter.secondValue}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => onRemoveFilter(filter.id)}
                  aria-label="Remover filtro"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
