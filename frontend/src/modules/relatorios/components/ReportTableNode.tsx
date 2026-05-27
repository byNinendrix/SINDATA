import { Link2, Move, X } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { ReportFieldOption, ReportTableMetadata } from '../types/reportBuilder.types';

interface ReportFieldDragData {
  tableId: string;
  fieldId: string;
}

interface TablePosition {
  x: number;
  y: number;
}

interface ReportTableNodeProps {
  table: ReportTableMetadata;
  position: TablePosition;
  selectedFieldKeys: Set<string>;
  manualRelationFieldKeys: Set<string>;
  isConnecting: boolean;
  connectionSourceFieldKey: string | null;
  hoverDropFieldKey: string | null;
  onToggleField: (fieldKey: string) => void;
  onRemoveTable: (tableId: string) => void;
  onStartTableDrag: (tableId: string, event: ReactPointerEvent<HTMLDivElement>) => void;
  onStartConnectionDrag: (source: ReportFieldDragData, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onRegisterFieldAnchor: (tableId: string, fieldId: string, element: HTMLButtonElement | null) => void;
  onFieldsScroll: () => void;
}

function fieldKey(tableId: string, fieldId: string) {
  return `${tableId}.${fieldId}`;
}

export function ReportTableNode({
  table,
  position,
  selectedFieldKeys,
  manualRelationFieldKeys,
  isConnecting,
  connectionSourceFieldKey,
  hoverDropFieldKey,
  onToggleField,
  onRemoveTable,
  onStartTableDrag,
  onStartConnectionDrag,
  onRegisterFieldAnchor,
  onFieldsScroll
}: ReportTableNodeProps) {
  const selectedCount = table.fields.filter((field) => selectedFieldKeys.has(fieldKey(table.id, field.id))).length;
  const previewFields: ReportFieldOption[] = table.fields;

  return (
    <div
      className="absolute flex max-h-[420px] w-[320px] flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
      style={{ left: position.x, top: position.y }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        className="mb-2 flex cursor-move items-start justify-between gap-2 rounded-lg border border-transparent px-1 py-1 transition hover:border-slate-200 hover:bg-slate-50"
        onPointerDown={(event) => onStartTableDrag(table.id, event)}
      >
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{table.name}</h4>
          <p className="text-[11px] text-slate-500">{selectedCount} campo(s) selecionado(s)</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500">
            <Move size={13} />
          </span>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => onRemoveTable(table.id)}
            aria-label={`Remover tabela ${table.name}`}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1" onScroll={onFieldsScroll}>
        {previewFields.map((field) => {
          const key = fieldKey(table.id, field.id);
          const isDragSource = connectionSourceFieldKey === key;
          const isDropTarget = hoverDropFieldKey === key;
          const hasRelation = manualRelationFieldKeys.has(key);
          const isPossibleTarget = isConnecting && !isDragSource && !connectionSourceFieldKey?.startsWith(`${table.id}.`);

          return (
            <div
              key={key}
              data-report-field-key={key}
              data-table-id={table.id}
              data-field-id={field.id}
              className={`flex items-center gap-2 rounded-md border px-1 py-1 text-xs text-slate-700 transition ${
                isDropTarget
                  ? 'border-cyan-300 bg-cyan-50'
                  : isDragSource
                    ? 'border-cyan-300 bg-cyan-50/80'
                    : hasRelation
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : isPossibleTarget
                        ? 'border-cyan-100 bg-cyan-50/40'
                        : 'border-transparent'
              }`}
            >
              <label className="flex min-w-0 flex-1 items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
                  checked={selectedFieldKeys.has(key)}
                  onChange={() => onToggleField(key)}
                  title="Adicionar/remover campo do relatorio"
                />
                <span className="truncate">{field.label}</span>
              </label>
              <button
                type="button"
                ref={(element) => onRegisterFieldAnchor(table.id, field.id, element)}
                onPointerDown={(event) => onStartConnectionDrag({ tableId: table.id, fieldId: field.id }, event)}
                className="inline-flex h-6 w-6 cursor-crosshair items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-cyan-300 hover:text-cyan-700"
                aria-label={`Arrastar campo ${field.label} para criar ligacao`}
                title="Arraste para criar ligacao"
              >
                <Link2 size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
