import { Trash2 } from 'lucide-react';
import { memo } from 'react';
import type { ReportBuilderConfig, ReportTableMetadata } from '../types/reportBuilder.types';

interface SelectedFieldsPanelProps {
  allTables: ReportTableMetadata[];
  selectedFieldKeys: string[];
  fieldAliases: Record<string, string>;
  config: ReportBuilderConfig;
  onRemoveField: (fieldKey: string) => void;
  onAliasChange: (fieldKey: string, alias: string) => void;
  onConfigChange: (next: ReportBuilderConfig) => void;
}

interface FieldItem {
  key: string;
  tableId: string;
  tableLabel: string;
  fieldLabel: string;
  isSortable: boolean;
  isGroupable: boolean;
}

function splitFieldKey(fieldKey: string) {
  const [tableId, fieldId] = fieldKey.split('.');
  return { tableId: tableId ?? '', fieldId: fieldId ?? '' };
}

export const SelectedFieldsPanel = memo(function SelectedFieldsPanel({
  allTables,
  selectedFieldKeys,
  fieldAliases,
  config,
  onRemoveField,
  onAliasChange,
  onConfigChange
}: SelectedFieldsPanelProps) {
  const tableMap = new Map(allTables.map((table) => [table.id, table]));

  const fieldItems: FieldItem[] = selectedFieldKeys
    .map((fieldKey) => {
      const { tableId, fieldId } = splitFieldKey(fieldKey);
      const table = tableMap.get(tableId);
      const field = table?.fields.find((item) => item.id === fieldId);
      return {
        key: fieldKey,
        tableId,
        tableLabel: table?.name ?? tableId,
        fieldLabel: field?.label ?? fieldId,
        isSortable: field?.isSortable !== false,
        isGroupable: field?.isGroupable !== false
      };
    })
    .filter((item) => Boolean(item.tableLabel) && Boolean(item.fieldLabel));

  const grouped = fieldItems.reduce<Record<string, FieldItem[]>>((acc, item) => {
    if (!acc[item.tableId]) {
      acc[item.tableId] = [];
    }
    acc[item.tableId].push(item);
    return acc;
  }, {});

  const sortableItems = fieldItems.filter((item) => item.isSortable);
  const groupableItems = fieldItems.filter((item) => item.isGroupable);

  return (
    <div className="space-y-4">
      <article className="ds-card space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Campos do relatorio</h3>
        {fieldItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600">
            <p className="font-medium">Nenhum campo selecionado.</p>
            <p className="mt-1">Marque campos nas tabelas para montar o resultado do relatorio.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(grouped).map(([tableId, items]) => (
              <div key={tableId} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  {items[0]?.tableLabel ?? tableId}
                </p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.key} className="rounded-lg border border-slate-200 bg-white p-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{item.fieldLabel}</p>
                          <p className="truncate text-xs text-slate-500">{item.key}</p>
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

                      <label className="form-label mt-2 text-xs">
                        Rotulo no relatorio
                        <p className="mt-0.5 text-[11px] font-normal text-slate-500">
                          Defina como o nome da coluna aparecera no resultado.
                        </p>
                        <input
                          type="text"
                          className="form-input mt-1 h-9 text-xs"
                          placeholder={`Ex.: ${item.tableLabel} ${item.fieldLabel}`}
                          value={fieldAliases[item.key] ?? ''}
                          onChange={(event) => onAliasChange(item.key, event.target.value)}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="ds-card space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Configuracoes da consulta</h3>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <label className="form-label">
            Ordenar por
            <select
              className="form-input mt-1"
              value={config.orderBy}
              onChange={(event) => onConfigChange({ ...config, orderBy: event.target.value })}
            >
              <option value="">Nao definir</option>
              {sortableItems.map((item) => (
                <option key={`order-${item.key}`} value={item.key}>
                  {fieldAliases[item.key] || item.fieldLabel} ({item.tableLabel})
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Direcao da ordenacao
            <select
              className="form-input mt-1"
              value={config.orderDirection}
              onChange={(event) =>
                onConfigChange({
                  ...config,
                  orderDirection: event.target.value === 'desc' ? 'desc' : 'asc'
                })
              }
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
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
              {groupableItems.map((item) => (
                <option key={`group-${item.key}`} value={item.key}>
                  {fieldAliases[item.key] || item.fieldLabel} ({item.tableLabel})
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Limite de registros
            <select
              className="form-input mt-1"
              value={config.limit}
              onChange={(event) => onConfigChange({ ...config, limit: event.target.value })}
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
              <option value="0">Sem limite</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
              checked={config.showTotals}
              onChange={(event) => onConfigChange({ ...config, showTotals: event.target.checked })}
            />
            Mostrar totalizadores
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
              checked={config.maskCpf}
              onChange={(event) => onConfigChange({ ...config, maskCpf: event.target.checked })}
            />
            Mascarar CPF
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
              checked={config.maskName}
              onChange={(event) => onConfigChange({ ...config, maskName: event.target.checked })}
            />
            Mascarar Nome
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
              checked={config.removeDuplicates}
              onChange={(event) => onConfigChange({ ...config, removeDuplicates: event.target.checked })}
            />
            Remover duplicados
          </label>
        </div>
      </article>
    </div>
  );
});
