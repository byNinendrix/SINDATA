import { Download, Eye, Save } from 'lucide-react';

interface ReportActionsProps {
  onAction: (action: 'preview' | 'save' | 'export') => void;
}

export function ReportActions({ onAction }: ReportActionsProps) {
  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Ações</h3>
        <p className="mt-1 text-sm text-slate-600">Ações iniciais para evolução do fluxo de geração de relatório.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary gap-2 px-4 py-2.5" onClick={() => onAction('preview')}>
          <Eye size={16} />
          Visualizar prévia
        </button>
        <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={() => onAction('save')}>
          <Save size={16} />
          Salvar modelo
        </button>
        <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={() => onAction('export')}>
          <Download size={16} />
          Exportar
        </button>
      </div>
    </article>
  );
}
