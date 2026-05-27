import { Download, Eye, RotateCcw, Save } from 'lucide-react';

interface ReportBuilderActionsProps {
  onPreview: () => void;
  onSaveModel: () => void;
  onExport: () => void;
  onClear: () => void;
}

export function ReportBuilderActions({
  onPreview,
  onSaveModel,
  onExport,
  onClear
}: ReportBuilderActionsProps) {
  return (
    <article className="ds-card space-y-3">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Acoes</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary gap-2 px-4 py-2.5" onClick={onPreview}>
          <Eye size={16} />
          Atualizar previa
        </button>
        <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={onSaveModel}>
          <Save size={16} />
          Salvar modelo
        </button>
        <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={onExport}>
          <Download size={16} />
          Exportar relatorio
        </button>
        <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={onClear}>
          <RotateCcw size={16} />
          Limpar construcao
        </button>
      </div>
    </article>
  );
}
