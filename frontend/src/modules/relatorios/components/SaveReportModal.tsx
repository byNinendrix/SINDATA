import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReportSaveCategory, ReportSaveVisibility, SavedReportMetadata } from '../types/reportBuilder.types';

interface SaveReportModalProps {
  open: boolean;
  initialData?: SavedReportMetadata | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: SavedReportMetadata) => void;
}

const categories: Array<{ value: ReportSaveCategory; label: string }> = [
  { value: 'geral', label: 'Geral' },
  { value: 'filiados', label: 'Filiados' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'escolas', label: 'Escolas' },
  { value: 'atendimentos', label: 'Atendimentos' },
  { value: 'personalizado', label: 'Personalizado' }
];

const visibilityOptions: Array<{ value: ReportSaveVisibility; label: string }> = [
  { value: 'somente_eu', label: 'Somente eu' },
  { value: 'equipe', label: 'Compartilhado com equipe' },
  { value: 'todos', label: 'Disponivel para todos' }
];

export function SaveReportModal({ open, initialData, saving, onClose, onSave }: SaveReportModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportSaveCategory>('geral');
  const [visibility, setVisibility] = useState<ReportSaveVisibility>('somente_eu');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(initialData?.name ?? '');
    setDescription(initialData?.description ?? '');
    setCategory(initialData?.category ?? 'geral');
    setVisibility(initialData?.visibility ?? 'somente_eu');
    setError('');
  }, [initialData, open]);

  if (!open) {
    return null;
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError('Nome do relatorio e obrigatorio.');
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      visibility
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Salvar relatorio</h3>
            <p className="mt-1 text-xs text-slate-500">
              Salve este modelo para reutilizar depois sem precisar montar tudo novamente.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="form-label sm:col-span-2">
            Nome do relatorio
            <p className="mt-0.5 text-[11px] font-normal text-slate-500">Campo obrigatorio.</p>
            <input type="text" className="form-input mt-1" value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label className="form-label sm:col-span-2">
            Descricao
            <textarea
              className="form-input mt-1 min-h-[86px]"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="form-label">
            Categoria
            <select
              className="form-input mt-1"
              value={category}
              onChange={(event) => setCategory(event.target.value as ReportSaveCategory)}
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Visibilidade
            <select
              className="form-input mt-1"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as ReportSaveVisibility)}
            >
              {visibilityOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={handleSubmit} disabled={saving}>
            Salvar relatorio
          </button>
        </div>
      </div>
    </div>
  );
}
