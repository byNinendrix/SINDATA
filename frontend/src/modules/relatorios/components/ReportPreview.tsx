interface ReportPreviewProps {
  selectedFieldKeys: string[];
  fieldLabelByKey: Record<string, string>;
  rows: Array<Record<string, string>>;
}

export function ReportPreview({ selectedFieldKeys, fieldLabelByKey, rows }: ReportPreviewProps) {
  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Prévia do relatório</h3>
        <p className="mt-1 text-sm text-slate-600">Resultado fictício para validar a estrutura selecionada.</p>
      </div>

      {selectedFieldKeys.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Selecione campos para visualizar uma prévia do relatório.
        </p>
      ) : (
        <div className="overflow-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {selectedFieldKeys.map((fieldKey) => (
                  <th key={fieldKey} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {fieldLabelByKey[fieldKey] ?? fieldKey}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, index) => (
                <tr key={`preview-row-${index}`} className="hover:bg-slate-50/70">
                  {selectedFieldKeys.map((fieldKey) => (
                    <td key={`${index}-${fieldKey}`} className="px-4 py-3 text-sm text-slate-700">
                      {row[fieldKey] ?? '-'}
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
