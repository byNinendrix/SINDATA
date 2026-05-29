import { Copy, Edit3, Play, Trash2 } from 'lucide-react';
import type { SavedReportModel } from '../types/reportBuilder.types';

interface SavedReportCardProps {
  report: SavedReportModel;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExport?: (id: string) => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString('pt-BR');
}

function prettifyCategory(category: string) {
  const map: Record<string, string> = {
    geral: 'Geral',
    filiados: 'Filiados',
    financeiro: 'Financeiro',
    escolas: 'Escolas',
    atendimentos: 'Atendimentos',
    personalizado: 'Personalizado'
  };
  return map[category] ?? category;
}

function prettifyVisibility(visibility: string) {
  const map: Record<string, string> = {
    somente_eu: 'Somente eu',
    equipe: 'Equipe',
    todos: 'Todos'
  };
  return map[visibility] ?? visibility;
}

export function SavedReportCard({ report, onOpen, onEdit, onDuplicate, onDelete, onExport }: SavedReportCardProps) {
  return (
    <article className="ds-card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{report.name}</h3>
          <p className="mt-1 text-xs text-slate-600">{report.description || 'Sem descricao'}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700">
            {prettifyCategory(report.category)}
          </span>
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] text-cyan-800">
            {prettifyVisibility(report.visibility)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 sm:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
          <p className="text-[11px] text-slate-500">Tabelas</p>
          <p className="font-semibold">{report.summary?.tablesCount ?? report.selectedTableIds.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
          <p className="text-[11px] text-slate-500">Campos</p>
          <p className="font-semibold">{report.summary?.fieldsCount ?? report.selectedFieldKeys.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
          <p className="text-[11px] text-slate-500">Filtros</p>
          <p className="font-semibold">{report.summary?.filtersCount ?? report.filters.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
          <p className="text-[11px] text-slate-500">Visibilidade</p>
          <p className="font-semibold">{prettifyVisibility(report.visibility)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
          <p className="text-[11px] text-slate-500">Ligacoes</p>
          <p className="font-semibold">{report.summary?.relationsCount ?? report.manualRelations.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1 text-xs text-slate-600 sm:grid-cols-2">
        <p>Criado por: {report.createdBy}</p>
        <p>Criacao: {formatDate(report.createdAt)}</p>
        <p>Atualizacao: {formatDate(report.updatedAt)}</p>
        <p>Status: {report.status}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary gap-2 px-3 py-2 text-xs" onClick={() => onOpen(report.id)}>
          <Play size={13} />
          Abrir
        </button>
        <button type="button" className="btn-secondary gap-2 px-3 py-2 text-xs" onClick={() => onEdit(report.id)}>
          <Edit3 size={13} />
          Editar
        </button>
        <button type="button" className="btn-secondary gap-2 px-3 py-2 text-xs" onClick={() => onDuplicate(report.id)}>
          <Copy size={13} />
          Duplicar
        </button>
        <button type="button" className="btn-secondary gap-2 px-3 py-2 text-xs" onClick={() => onOpen(report.id)}>
          Executar
        </button>
        <button type="button" className="btn-secondary gap-2 px-3 py-2 text-xs" onClick={() => (onExport ? onExport(report.id) : onOpen(report.id))}>
          Exportar
        </button>
        <button type="button" className="btn-secondary gap-2 px-3 py-2 text-xs" onClick={() => onDelete(report.id)}>
          <Trash2 size={13} />
          Excluir
        </button>
      </div>
    </article>
  );
}
