import { FolderOpen, PlusCircle, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SavedReportCard } from '../components/SavedReportCard';
import { deleteReport, duplicateReport, getSavedReports } from '../services/reportStorageService';
import type { SavedReportModel, SavedReportStorageMode } from '../types/reportBuilder.types';

const categoryLabelMap: Record<string, string> = {
  geral: 'Geral',
  filiados: 'Filiados',
  financeiro: 'Financeiro',
  escolas: 'Escolas',
  atendimentos: 'Atendimentos',
  personalizado: 'Personalizado'
};

export function SavedReportsPage() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [reports, setReports] = useState<SavedReportModel[]>([]);
  const [sourceMode, setSourceMode] = useState<SavedReportStorageMode>('api');
  const [hasLocalModels, setHasLocalModels] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string>('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('todos');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await getSavedReports();
        if (cancelled) {
          return;
        }
        setReports(result.data.reports);
        setSourceMode(result.mode);
        setHasLocalModels(result.data.hasLocalModels);
        if (result.warning) {
          setFeedback(result.warning);
        }
      } catch {
        if (!cancelled) {
          setFeedback('Nao foi possivel carregar os modelos salvos.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [version]);

  const filteredReports = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return reports.filter((report) => {
      const categoryMatch = category === 'todos' || report.category === category;
      const searchMatch =
        !searchTerm ||
        report.name.toLowerCase().includes(searchTerm) ||
        report.description.toLowerCase().includes(searchTerm);
      return categoryMatch && searchMatch;
    });
  }, [category, reports, search]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(reports.map((report) => report.category))).sort();
    return [
      { value: 'todos', label: 'Todas as categorias' },
      ...categories.map((value) => ({
        value,
        label: categoryLabelMap[value] ?? value
      }))
    ];
  }, [reports]);

  useEffect(() => {
    if (category === 'todos') {
      return;
    }
    const exists = categoryOptions.some((option) => option.value === category);
    if (!exists) {
      setCategory('todos');
    }
  }, [category, categoryOptions]);

  function refresh(message?: string) {
    if (message) {
      setFeedback(message);
    }
    setVersion((current) => current + 1);
  }

  function openReport(id: string) {
    navigate(`/relatorios/gerador?modelId=${id}`);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus modelos salvos</h1>
          <p className="text-sm text-slate-600">Encontre, reutilize e mantenha seus modelos de relatorio organizados.</p>
        </div>
        <button type="button" className="btn-primary gap-2 px-4 py-2.5" onClick={() => navigate('/relatorios/gerador')}>
          <PlusCircle size={16} />
          Criar novo relatorio
        </button>
      </header>

      <article className="ds-card space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_240px]">
          <label className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="form-input h-10 pl-9"
              placeholder="Buscar por nome do relatorio"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-700">Filtrar por categoria</span>
            <select className="form-input h-10" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-xs text-slate-600">
          {filteredReports.length} modelo(s) encontrado(s) de {reports.length} salvo(s).
        </p>
      </article>

      {sourceMode === 'local' ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Modo local temporario</div>
      ) : null}

      {sourceMode === 'api' && hasLocalModels ? (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
          Existem modelos salvos localmente neste navegador. Em uma proxima etapa, eles poderao ser sincronizados com o servidor.
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">{feedback}</div>
      ) : null}

      {loading ? (
        <article className="ds-card">
          <p className="text-sm text-slate-600">Carregando modelos salvos...</p>
        </article>
      ) : reports.length === 0 ? (
        <article className="ds-card">
          <div className="flex items-start gap-2 text-slate-700">
            <FolderOpen size={18} className="mt-0.5" />
            <div>
              <p className="text-sm font-medium">Nenhum modelo salvo ainda.</p>
              <p className="mt-1 text-sm text-slate-600">
                Crie um relatorio no Gerador de Relatorios e salve como modelo para reutilizar depois.
              </p>
            </div>
          </div>
        </article>
      ) : filteredReports.length === 0 ? (
        <article className="ds-card">
          <p className="text-sm text-slate-600">
            {category !== 'todos'
              ? 'Nenhum modelo encontrado para esta categoria.'
              : 'Nenhum modelo encontrado para os filtros informados.'}
          </p>
        </article>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <SavedReportCard
              key={report.id}
              report={report}
              onOpen={openReport}
              onEdit={openReport}
              onDuplicate={(id) => {
                void duplicateReport(id)
                  .then((result) => {
                    const duplicated = result.data;
                    refresh(
                      duplicated
                        ? result.mode === 'local'
                          ? 'Relatorio duplicado localmente neste navegador.'
                          : `Relatorio duplicado: ${duplicated.name}`
                        : 'Nao foi possivel duplicar o relatorio.'
                    );
                  })
                  .catch(() => {
                    refresh('Nao foi possivel duplicar o relatorio.');
                  });
              }}
              onDelete={(id) => {
                const confirmed = window.confirm(
                  'Deseja excluir este modelo salvo?\nEssa acao nao pode ser desfeita.'
                );
                if (!confirmed) {
                  return;
                }
                void deleteReport(id)
                  .then((result) => {
                    refresh(
                      result.mode === 'local'
                        ? 'Relatorio removido localmente neste navegador.'
                        : 'Relatorio removido com sucesso.'
                    );
                  })
                  .catch(() => {
                    refresh('Nao foi possivel remover o relatorio.');
                  });
              }}
              onExport={openReport}
            />
          ))}
        </div>
      )}
    </section>
  );
}
