import { Link2, Plus } from 'lucide-react';
import type {
  ReportManualRelationDraft,
  ReportRelationOption,
  ReportTableMetadata
} from '../types/reportBuilder.types';

interface RelationSuggestionItem {
  sourceTableId: string;
  sourceFieldLabel: string;
  targetTableId: string;
  targetFieldLabel: string;
}

interface ManualRelationsBuilderProps {
  selectedTables: ReportTableMetadata[];
  relationsMetadata: ReportRelationOption[];
  draft: ReportManualRelationDraft;
  onDraftChange: (next: ReportManualRelationDraft) => void;
  onAddRelation: () => void;
  onApplySuggestion: (suggestion: RelationSuggestionItem) => void;
}

export function ManualRelationsBuilder({
  selectedTables,
  relationsMetadata,
  draft,
  onDraftChange,
  onAddRelation,
  onApplySuggestion
}: ManualRelationsBuilderProps) {
  const selectedTableMap = new Map(selectedTables.map((table) => [table.id, table]));
  const sourceFields = selectedTableMap.get(draft.sourceTableId)?.fields ?? [];
  const targetFields = selectedTableMap.get(draft.targetTableId)?.fields ?? [];
  const selectedSet = new Set(selectedTables.map((table) => table.id));

  const suggestions: RelationSuggestionItem[] = relationsMetadata
    .filter((relation) => {
      if (relation.requiredTable) {
        return false;
      }
      const source = relation.fromTable ?? relation.fromTableId ?? '';
      const target = relation.toTable ?? relation.toTableId ?? '';
      return selectedSet.has(source) && selectedSet.has(target) && relation.fromFieldLabel && relation.toFieldLabel;
    })
    .map((relation) => {
      const sourceTableId = relation.fromTable ?? relation.fromTableId ?? '';
      const targetTableId = relation.toTable ?? relation.toTableId ?? '';
      return {
        sourceTableId,
        sourceFieldLabel: relation.fromFieldLabel ?? '',
        targetTableId,
        targetFieldLabel: relation.toFieldLabel ?? ''
      };
    });

  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Ligacoes entre tabelas</h3>
        <p className="mt-1 text-xs text-slate-600">
          Escolha manualmente como uma tabela se conecta com a outra.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-5">
        <label className="form-label">
          Tabela de origem
          <select
            className="form-input mt-1"
            value={draft.sourceTableId}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                sourceTableId: event.target.value,
                sourceFieldId: ''
              })
            }
          >
            <option value="">Selecione</option>
            {selectedTables.map((table) => (
              <option key={`source-${table.id}`} value={table.id}>
                {table.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Campo de origem
          <select
            className="form-input mt-1"
            value={draft.sourceFieldId}
            onChange={(event) => onDraftChange({ ...draft, sourceFieldId: event.target.value })}
            disabled={!draft.sourceTableId}
          >
            <option value="">Selecione</option>
            {sourceFields.map((field) => (
              <option key={`source-field-${field.id}`} value={field.id}>
                {field.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Tabela de destino
          <select
            className="form-input mt-1"
            value={draft.targetTableId}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                targetTableId: event.target.value,
                targetFieldId: ''
              })
            }
          >
            <option value="">Selecione</option>
            {selectedTables.map((table) => (
              <option key={`target-${table.id}`} value={table.id}>
                {table.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Campo de destino
          <select
            className="form-input mt-1"
            value={draft.targetFieldId}
            onChange={(event) => onDraftChange({ ...draft, targetFieldId: event.target.value })}
            disabled={!draft.targetTableId}
          >
            <option value="">Selecione</option>
            {targetFields.map((field) => (
              <option key={`target-field-${field.id}`} value={field.id}>
                {field.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Tipo de ligacao
          <select
            className="form-input mt-1"
            value={draft.operator}
            onChange={() => onDraftChange({ ...draft, operator: 'equals' })}
          >
            <option value="equals">Igual</option>
          </select>
        </label>
      </div>

      <button type="button" className="btn-secondary gap-2 px-3 py-2 text-xs" onClick={onAddRelation}>
        <Plus size={14} />
        Adicionar ligacao
      </button>

      {suggestions.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-cyan-200 bg-cyan-50/40 p-3">
          <p className="text-xs font-semibold text-cyan-900">Sugestoes de ligacao</p>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={`relation-suggestion-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cyan-200 bg-white px-2.5 py-2 text-xs text-slate-700">
                <span>
                  {(selectedTableMap.get(suggestion.sourceTableId)?.name ?? suggestion.sourceTableId) +
                    '.' +
                    suggestion.sourceFieldLabel}{' '}
                  {'->'}{' '}
                  {(selectedTableMap.get(suggestion.targetTableId)?.name ?? suggestion.targetTableId) +
                    '.' +
                    suggestion.targetFieldLabel}
                </span>
                <button
                  type="button"
                  className="btn-secondary px-2 py-1 text-[11px]"
                  onClick={() => onApplySuggestion(suggestion)}
                >
                  Usar sugestao
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Link2 size={13} />
          Campos de ligacao podem ser diferentes dos campos de retorno.
        </span>
      </div>
    </article>
  );
}
