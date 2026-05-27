import { Trash2 } from 'lucide-react';
import type { ReportBuilderConfig, ReportTableMetadata } from '../types/reportBuilder.types';

interface SelectedFieldsPanelProps {
  allTables: ReportTableMetadata[];
  selectedFieldKeys: string[];
  config: ReportBuilderConfig;
  onRemoveField: (fieldKey: string) => void;
  onConfigChange: (next: ReportBuilderConfig) => void;
}

function splitFieldKey(fieldKey: string) {
  const [tableId, fieldId] = fieldKey.split('.');
  return { tableId: tableId ?? '', fieldId: fieldId ?? '' };
}

export function SelectedFieldsPanel({
  allTables,
  selectedFieldKeys,
  config,
  onRemoveField,
  onConfigChange
}: SelectedFieldsPanelProps) {
  const tableMap = new Map(allTables.map((table) => [table.id, table]));

  const fieldItems = selectedFieldKeys
    .map((fieldKey) => {
      const { tableId, fieldId } = splitFieldKey(fieldKey);
      const table = tableMap.get(tableId);
      const field = table?.fields.find((item) => item.id === fieldId);
      return {
        key: fieldKey,
        tableLabel: table?.name ?? tableId,
        fieldLabel:
          (fieldKey === 'pessoas.cpf_mascarado' || fieldKey === 'pessoas.cpf') && !config.maskCpf
            ? 'CPF'
            : field?.label ?? fieldId
      };
    })
    .filter((item) => Boolean(item.tableLabel) && Boolean(item.fieldLabel));

  return (
    <div className="space-y-4">
      <article className="ds-card space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Campos do relatorio</h3>
        {fieldItems.length === 0 ? (
          <p className="text-sm text-slate-600">Nenhum campo selecionado no momento.</p>
        ) : (
          <div className="space-y-2">
            {fieldItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{item.fieldLabel}</p>
                  <p className="truncate text-xs text-slate-500">{item.tableLabel}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => onRemoveField(item.key)}
                  aria-label={`Remover campo ${item.fieldLabel}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="ds-card space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Configuracoes</h3>
        <div className="space-y-2">
          <label className="form-label">
            Ordenar por
            <select
              className="form-input mt-1"
              value={config.orderBy}
              onChange={(event) => onConfigChange({ ...config, orderBy: event.target.value })}
            >
              <option value="">Nao definir</option>
              {fieldItems.map((item) => (
                <option key={`order-${item.key}`} value={item.key}>
                  {item.fieldLabel} ({item.tableLabel})
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Agrupar por
            <select
              className="form-input mt-1"
              value={config.groupBy}
              onChange={(event) => onConfigChange({ ...config, groupBy: event.target.value })}
            >
              <option value="">Nao definir</option>
              {fieldItems.map((item) => (
                <option key={`group-${item.key}`} value={item.key}>
                  {item.fieldLabel} ({item.tableLabel})
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Limite de registros
            <input
              type="number"
              min={1}
              className="form-input mt-1"
              value={config.limit}
              onChange={(event) => onConfigChange({ ...config, limit: event.target.value })}
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
              checked={config.showTotals}
              onChange={(event) => onConfigChange({ ...config, showTotals: event.target.checked })}
            />
            Mostrar totalizadores
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
              checked={config.maskCpf}
              onChange={(event) => onConfigChange({ ...config, maskCpf: event.target.checked })}
            />
            Mascarar CPF
          </label>
        </div>
      </article>
    </div>
  );
}
