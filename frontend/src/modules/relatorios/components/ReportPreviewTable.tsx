import type { ReportTableMetadata } from '../types/reportBuilder.types';

interface ReportPreviewTableProps {
  selectedFieldKeys: string[];
  allTables: ReportTableMetadata[];
  rows: Array<Record<string, unknown>>;
  filtersCount: number;
  tablesUsed: number;
  relationsCount: number;
  maskCpf: boolean;
  previewSource: 'mock' | 'database';
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

function maskCpfValue(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) {
    return value;
  }
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
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
  rows,
  filtersCount,
  tablesUsed,
  relationsCount,
  maskCpf,
  previewSource
}: ReportPreviewTableProps) {
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
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
          Campos selecionados: {selectedFieldKeys.length} | Tabelas utilizadas: {tablesUsed} | Filtros aplicados:{' '}
          {filtersCount} | Ligacoes criadas: {relationsCount}
        </div>
      </div>

      {selectedFieldKeys.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Selecione campos nas tabelas para visualizar uma previa do relatorio.
        </p>
      ) : (
        <div className="overflow-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {selectedFieldKeys.map((fieldKey) => (
                  <th key={fieldKey} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {getFieldLabel(fieldKey, allTables, maskCpf)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.slice(0, 5).map((row, rowIndex) => (
                <tr key={`report-preview-row-${rowIndex}`} className="hover:bg-slate-50/70">
                  {selectedFieldKeys.map((fieldKey) => (
                    <td key={`${rowIndex}-${fieldKey}`} className="px-4 py-3 text-sm text-slate-700">
                      {getCellValue(row, fieldKey, maskCpf)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
