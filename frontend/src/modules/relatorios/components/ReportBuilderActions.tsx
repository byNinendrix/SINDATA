import { Download, Eye, FilePlus2, FolderOpen, RotateCcw, Save } from 'lucide-react';

interface ReportBuilderActionsProps {
  onPreview: () => void;
  onSaveModel: () => void;
  onExport: () => void;
  onClear: () => void;
  onOpenModels: () => void;
  onNewReport: () => void;
  previewLoading?: boolean;
}

export function ReportBuilderActions({
  onPreview,
  onSaveModel,
  onExport,
  onClear,
  onOpenModels,
  onNewReport,
  previewLoading = false
}: ReportBuilderActionsProps) {
  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Acoes do relatorio</h3>
        <p className="mt-1 text-xs text-slate-600">Atualize a previa e gerencie seu modelo salvo.</p>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Grupo principal</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary gap-2 px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={onPreview}
            disabled={previewLoading}
          >
            <Eye size={16} />
            {previewLoading ? 'Carregando previa...' : 'Atualizar previa'}
          </button>
          <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={onSaveModel}>
            <Save size={16} />
            Salvar relatorio
          </button>
          <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={onExport}>
            <Download size={16} />
            Exportar relatorio
          </button>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Grupo secundario</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={onOpenModels}>
            <FolderOpen size={16} />
            Meus modelos
          </button>
          <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={onExport}>
            <Download size={16} />
            Exportar relatorio
          </button>
          <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={onNewReport}>
            <FilePlus2 size={16} />
            Novo relatorio
          </button>
          <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={onClear}>
            <RotateCcw size={16} />
            Limpar construcao
          </button>
        </div>
      </div>
    </article>
  );
}
