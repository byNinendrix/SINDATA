import { Plus, Trash2 } from 'lucide-react';
import { memo } from 'react';
import type {
  ReportFieldType,
  ReportFilterCondition,
  ReportFilterDraftState,
  ReportMetadataFilterOperator,
  ReportFilterRule,
  ReportTableMetadata
} from '../types/reportBuilder.types';

interface ReportFiltersPanelProps {
  selectedTables: ReportTableMetadata[];
  conditionsByType: Record<ReportFieldType, ReportFilterCondition[]>;
  operatorMetadataByType?: Record<ReportFieldType, ReportMetadataFilterOperator[]>;
  draft: ReportFilterDraftState;
  filters: ReportFilterRule[];
  onDraftChange: (next: ReportFilterDraftState) => void;
  onAddFilter: () => void;
  onRemoveFilter: (filterId: string) => void;
  onClearFilters: () => void;
}

function toFieldType(value?: string): ReportFieldType {
  if (value === 'numero' || value === 'data' || value === 'booleano' || value === 'lista') {
    return value;
  }
  return 'texto';
}

function isRangeCondition(condition: string) {
  return condition === 'Entre';
}

function isNoValueCondition(condition: string) {
  return (
    condition === 'Esta vazio' ||
    condition === 'Nao esta vazio' ||
    condition === 'Este mes' ||
    condition === 'Este ano' ||
    condition === 'Ultimos 7 dias' ||
    condition === 'Ultimos 30 dias' ||
    condition === 'Sim' ||
    condition === 'Nao'
  );
}

function renderValueInput(
  fieldType: ReportFieldType,
  value: string,
  onChange: (next: string) => void,
  disabled = false
) {
  if (fieldType === 'booleano') {
    return (
      <select className="form-input mt-1" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        <option value="">Selecione</option>
        <option value="Sim">Sim</option>
        <option value="Nao">Nao</option>
      </select>
    );
  }

  if (fieldType === 'data') {
    return (
      <input
        type="date"
        className="form-input mt-1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    );
  }

  if (fieldType === 'numero') {
    return (
      <input
        type="number"
        className="form-input mt-1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    );
  }

  return (
    <input
      type="text"
      className="form-input mt-1"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      placeholder="Informe o valor"
    />
  );
}

export const ReportFiltersPanel = memo(function ReportFiltersPanel({
  selectedTables,
  conditionsByType,
  operatorMetadataByType,
  draft,
  filters,
  onDraftChange,
  onAddFilter,
  onRemoveFilter,
  onClearFilters
}: ReportFiltersPanelProps) {
  const selectedTable = selectedTables.find((table) => table.id === draft.tableId);
  const availableFields = (selectedTable?.fields ?? []).filter((field) => field.isFilterable !== false);
  const availableConditions = conditionsByType[draft.fieldType] ?? conditionsByType.texto;
  const tableMap = new Map(selectedTables.map((table) => [table.id, table]));

  const selectedOperatorMeta =
    operatorMetadataByType?.[draft.fieldType]?.find((item) => item.displayName === draft.condition) ?? null;

  const conditionNeedsValue =
    selectedOperatorMeta?.requiresValue ?? !isNoValueCondition(draft.condition);
  const conditionNeedsSecondValue =
    selectedOperatorMeta?.requiresSecondValue ?? isRangeCondition(draft.condition);

  return (
    <article className="ds-card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Filtros da consulta</h3>
          <p className="mt-1 text-xs text-slate-600">Defina regras para refinar os dados retornados no relatorio.</p>
        </div>
        <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={onClearFilters}>
          Limpar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-7">
        <label className="form-label">
          Conector
          <select
            className="form-input mt-1"
            value={draft.connector}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                connector: event.target.value === 'OU' ? 'OU' : 'E'
              })
            }
          >
            <option value="E">E</option>
            <option value="OU">OU</option>
          </select>
        </label>

        <label className="form-label">
          Tabela
          <select
            className="form-input mt-1"
            value={draft.tableId}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                tableId: event.target.value,
                fieldId: '',
                fieldType: 'texto',
                condition: 'Igual a',
                value: '',
                secondValue: ''
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

        <label className="form-label">
          Campo
          <select
            className="form-input mt-1"
            value={draft.fieldId}
            onChange={(event) => {
              const field = availableFields.find((item) => item.id === event.target.value);
              const fieldType = toFieldType(field?.type);
              const conditions = conditionsByType[fieldType] ?? conditionsByType.texto;
              onDraftChange({
                ...draft,
                fieldId: event.target.value,
                fieldType,
                condition: conditions[0] ?? 'Igual a',
                value: '',
                secondValue: ''
              });
            }}
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

        <label className="form-label">
          Tipo
          <input type="text" className="form-input mt-1" value={draft.fieldType} readOnly />
        </label>

        <label className="form-label">
          Condicao
          <select
            className="form-input mt-1"
            value={draft.condition}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                condition: event.target.value as ReportFilterCondition,
                value: '',
                secondValue: ''
              })
            }
          >
            {availableConditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Valor
          {renderValueInput(draft.fieldType, draft.value, (next) => onDraftChange({ ...draft, value: next }), !conditionNeedsValue)}
        </label>

        <label className="form-label">
          {conditionNeedsSecondValue ? 'Valor final' : 'Complemento'}
          {renderValueInput(
            draft.fieldType,
            draft.secondValue ?? '',
            (next) => onDraftChange({ ...draft, secondValue: next }),
            !conditionNeedsSecondValue
          )}
        </label>
      </div>

      <button type="button" className="btn-secondary gap-2 px-3 py-2 text-xs" onClick={onAddFilter}>
        <Plus size={14} />+ Adicionar filtro
      </button>

      {filters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600">
          <p className="font-medium">Nenhum filtro aplicado.</p>
          <p className="mt-1">Adicione filtros para refinar os dados do relatorio.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filters.map((filter) => {
            const table = tableMap.get(filter.tableId);
            const field = table?.fields.find((item) => item.id === filter.fieldId);
            return (
              <div
                key={filter.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="text-xs text-slate-700">
                  <p className="font-semibold">
                    {filter.connector ?? 'E'} | {table?.name ?? filter.tableId}
                  </p>
                  <p>
                    {field?.label ?? filter.fieldId} | {filter.fieldType ?? 'texto'} | {filter.condition}
                    {isNoValueCondition(filter.condition) ? '' : ` | ${filter.value}`}
                    {isRangeCondition(filter.condition) && filter.secondValue ? ` | ${filter.secondValue}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
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
});
