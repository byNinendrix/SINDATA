import type { ReportTableMetadata } from '../types/reportBuilder.types';

interface ReportPreviewTableProps {
  selectedFieldKeys: string[];
  allTables: ReportTableMetadata[];
  fieldAliases: Record<string, string>;
  previewColumns?: Array<{
    fieldId: string;
    label: string;
    dataType: 'text' | 'number' | 'date' | 'boolean' | 'option';
    isSensitive: boolean;
    maskType: 'none' | 'cpf' | 'name' | 'currency' | 'date';
  }>;
  rows: Array<Record<string, unknown>>;
  filtersCount: number;
  tablesUsed: number;
  relationsCount: number;
  maskCpf: boolean;
  maskName: boolean;
  previewSource: 'mock' | 'database';
  isLoading?: boolean;
  warning?: string;
}

function getFieldLabel(fieldKey: string, tables: ReportTableMetadata[], maskCpf: boolean) {
  if ((fieldKey === 'pessoas.cpf_mascarado' || fieldKey === 'pessoas.cpf') && !maskCpf) {
    return 'CPF';
  }
  const [tableId, fieldId] = fieldKey.split('.');
  const table = tables.find((item) => item.id === tableId);
  const field = table?.fields.find((item) => item.id === fieldId);
  return field?.label ?? fieldId ?? fieldKey;
}

function getTableLabel(fieldKey: string, tables: ReportTableMetadata[]) {
  const [tableId] = fieldKey.split('.');
  return tables.find((item) => item.id === tableId)?.name ?? tableId ?? '';
}

function maskCpfValue(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) {
    return value;
  }
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
}

function maskNameValue(value: string) {
  const raw = value.trim();
  if (!raw) {
    return raw;
  }
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return `${parts[0].slice(0, 1)}***`;
  }
  if (parts.length === 2) {
    return `${parts[0]} ***`;
  }
  return `${parts[0]} *** ${parts[parts.length - 1]}`;
}

function shouldMaskNameField(fieldId: string, label: string, maskType: 'none' | 'cpf' | 'name' | 'currency' | 'date') {
  if (maskType === 'name') {
    return true;
  }
  const normalizedFieldId = fieldId.trim().toLowerCase();
  if (normalizedFieldId === 'pessoas.nome') {
    return true;
  }
  const normalizedLabel = label.trim().toLowerCase();
  return normalizedLabel === 'nome' || normalizedLabel.includes('nome da pessoa');
}

function getFieldMaskType(fieldKey: string, tables: ReportTableMetadata[]) {
  const [tableId, fieldId] = fieldKey.split('.');
  const table = tables.find((item) => item.id === tableId);
  const field = table?.fields.find((item) => item.id === fieldId);
  return field?.maskType ?? 'none';
}

function toCellText(value: unknown) {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return String(value);
}

function getCellValue(row: Record<string, unknown>, fieldKey: string, maskCpf: boolean) {
  if (fieldKey === 'pessoas.cpf' || fieldKey === 'pessoas.cpf_mascarado') {
    const rawValue = toCellText(row['pessoas.cpf_mascarado_raw'] ?? row['pessoas.cpf_mascarado'] ?? row[fieldKey]);
    if (!maskCpf) {
      return rawValue;
    }
    return maskCpfValue(rawValue);
  }
  return toCellText(row[fieldKey]);
}

export function ReportPreviewTable({
  selectedFieldKeys,
  allTables,
  fieldAliases,
  previewColumns,
  rows,
  filtersCount,
  tablesUsed,
  relationsCount,
  maskCpf,
  maskName,
  previewSource,
  isLoading = false,
  warning
}: ReportPreviewTableProps) {
  const hasApiColumns = Array.isArray(previewColumns) && previewColumns.length > 0;
  const activeFieldKeys = hasApiColumns ? previewColumns.map((column) => column.fieldId) : selectedFieldKeys;

  const rawLabels = selectedFieldKeys.map((fieldKey) => getFieldLabel(fieldKey, allTables, maskCpf));
  const labelCounts = rawLabels.reduce<Record<string, number>>((acc, label) => {
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  function resolveHeaderLabel(fieldKey: string, index: number) {
    const alias = fieldAliases[fieldKey]?.trim();
    if (alias) {
      return alias;
    }

    const baseLabel = rawLabels[index];
    if ((labelCounts[baseLabel] ?? 0) > 1) {
      return `${getTableLabel(fieldKey, allTables)}.${baseLabel}`;
    }
    return baseLabel;
  }

  return (
    <article className="ds-card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Previa do resultado</h3>
          <p className="mt-1 text-xs text-slate-600">
            {previewSource === 'database'
              ? 'Resultado real consultado em modo somente leitura.'
              : 'Resultado ficticio baseado nos campos escolhidos.'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <p>Campos selecionados: {selectedFieldKeys.length}</p>
          <p>Tabelas utilizadas: {tablesUsed}</p>
          <p>Filtros aplicados: {filtersCount}</p>
          <p>Ligacoes criadas: {relationsCount}</p>
        </div>
      </div>

      {warning ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{warning}</p>
      ) : null}

      {activeFieldKeys.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Selecione ao menos um campo para visualizar a previa.
        </p>
      ) : isLoading ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Consultando dados, aguarde...
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Nenhum registro encontrado para os filtros aplicados.
        </p>
      ) : (
        <div className="overflow-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {hasApiColumns
                  ? previewColumns.map((column) => (
                      <th
                        key={column.fieldId}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                      >
                        {column.label}
                      </th>
                    ))
                  : selectedFieldKeys.map((fieldKey, index) => (
                      <th
                        key={fieldKey}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                      >
                        {resolveHeaderLabel(fieldKey, index)}
                      </th>
                    ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.slice(0, 5).map((row, rowIndex) => (
                <tr key={`report-preview-row-${rowIndex}`} className="hover:bg-slate-50/70">
                  {hasApiColumns
                  ? previewColumns.map((column) => (
                      <td key={`${rowIndex}-${column.fieldId}`} className="px-4 py-3 text-sm text-slate-700">
                          {(() => {
                            const raw = toCellText(row[column.label]);
                            if (maskCpf && column.maskType === 'cpf') {
                              return maskCpfValue(raw);
                            }
                            if (maskName && shouldMaskNameField(column.fieldId, column.label, column.maskType)) {
                              return maskNameValue(raw);
                            }
                            return raw;
                          })()}
                        </td>
                    ))
                    : selectedFieldKeys.map((fieldKey) => {
                        const maskType = getFieldMaskType(fieldKey, allTables);
                        const rawValue = getCellValue(row, fieldKey, false);
                        const value =
                          maskCpf && maskType === 'cpf'
                            ? maskCpfValue(String(rawValue ?? ''))
                            : maskName && maskType === 'name'
                            ? maskNameValue(String(rawValue ?? ''))
                            : getCellValue(row, fieldKey, maskCpf);
                        return (
                          <td key={`${rowIndex}-${fieldKey}`} className="px-4 py-3 text-sm text-slate-700">
                            {value}
                          </td>
                        );
                      })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
