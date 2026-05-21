import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import api from '../../../services/api';

type DashboardCardKey =
  | 'totalPessoas'
  | 'pessoasFiliadasAtivas'
  | 'pessoasDesfiliadas'
  | 'pessoasSemRegistroFiliacao'
  | 'totalFiliacoes'
  | 'filiacoesAtivas'
  | 'filiacoesDesfiliadas'
  | 'filiacoesSemVinculoPessoa';

interface DashboardResumo {
  totalPessoas: number;
  filiadosAtivos: number;
  desfiliados: number;
  contribuintes: number;
  totalFiliacoes: number;
  totalFiliacoesAtivas: number;
  totalFiliacoesDesfiliadas: number;
  totalFiliacoesSemVinculoPessoa: number;
}

interface DashboardDetalheItem {
  cpf: string;
  nome: string;
}

interface DashboardDetalhesResponse {
  items: DashboardDetalheItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface DashboardCard {
  key: DashboardCardKey;
  title: string;
  value: number;
  description?: string;
}

const initialResumo: DashboardResumo = {
  totalPessoas: 0,
  filiadosAtivos: 0,
  desfiliados: 0,
  contribuintes: 0,
  totalFiliacoes: 0,
  totalFiliacoesAtivas: 0,
  totalFiliacoesDesfiliadas: 0,
  totalFiliacoesSemVinculoPessoa: 0
};

const initialDetalhes: DashboardDetalhesResponse = {
  items: [],
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0
  }
};

interface AnimatedMetricValueProps {
  value: number;
  loading: boolean;
}

function AnimatedMetricValue({ value, loading }: AnimatedMetricValueProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (loading) {
      setAnimatedValue(0);
      return;
    }

    const durationMs = 900;
    const start = performance.now();
    const target = Math.max(0, value);
    let rafId = 0;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      const nextValue = Math.round(target * easedProgress);

      setAnimatedValue(nextValue);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [loading, value]);

  if (loading) {
    return <>--</>;
  }

  return <>{animatedValue.toLocaleString('pt-BR')}</>;
}

export function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo>(initialResumo);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<DashboardCard | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [detalhes, setDetalhes] = useState<DashboardDetalhesResponse>(initialDetalhes);

  useEffect(() => {
    async function loadResumo() {
      try {
        const response = await api.get<{ data: DashboardResumo }>('/dashboard/resumo');
        setResumo(response.data.data);
      } catch {
        setResumo(initialResumo);
      } finally {
        setLoading(false);
      }
    }

    void loadResumo();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchDebounced(searchInput.trim());
      setDetailsPage(1);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    if (!selectedCard) {
      return;
    }

    const activeCard = selectedCard;
    let isMounted = true;

    async function loadDetalhes() {
      setDetailsLoading(true);
      setDetailsError('');

      try {
        const response = await api.get<{ data: DashboardDetalhesResponse }>('/dashboard/detalhes', {
          params: {
            cardKey: activeCard.key,
            search: searchDebounced,
            page: detailsPage,
            pageSize: 50
          }
        });

        if (!isMounted) {
          return;
        }

        setDetalhes(response.data.data);
      } catch {
        if (!isMounted) {
          return;
        }

        setDetalhes(initialDetalhes);
        setDetailsError('Não foi possível carregar os detalhes desta consulta.');
      } finally {
        if (isMounted) {
          setDetailsLoading(false);
        }
      }
    }

    void loadDetalhes();

    return () => {
      isMounted = false;
    };
  }, [selectedCard, searchDebounced, detailsPage]);

  useEffect(() => {
    if (!selectedCard) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedCard(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedCard]);

  const cards = useMemo<DashboardCard[]>(
    () => [
      { key: 'totalPessoas', title: 'Total de Pessoas', value: resumo.totalPessoas },
      {
        key: 'pessoasFiliadasAtivas',
        title: 'Pessoas Filiadas Ativas',
        value: resumo.filiadosAtivos,
        description: `de ${resumo.totalPessoas.toLocaleString('pt-BR')} pessoas no sistema`
      },
      {
        key: 'pessoasDesfiliadas',
        title: 'Pessoas Desfiliadas',
        value: resumo.desfiliados,
        description: `de ${resumo.totalPessoas.toLocaleString('pt-BR')} pessoas no sistema`
      },
      {
        key: 'pessoasSemRegistroFiliacao',
        title: 'Pessoas sem nenhum registro de filiação',
        value: resumo.contribuintes,
        description: `de ${resumo.totalPessoas.toLocaleString('pt-BR')} pessoas no sistema`
      }
    ],
    [resumo]
  );

  const filiacaoCards = useMemo<DashboardCard[]>(
    () => [
      {
        key: 'totalFiliacoes',
        title: 'Total de Filiações (Ativos/Desfiliados)',
        value: resumo.totalFiliacoes
      },
      {
        key: 'filiacoesAtivas',
        title: 'Filiações Ativas',
        value: resumo.totalFiliacoesAtivas,
        description: `de ${resumo.totalFiliacoes.toLocaleString('pt-BR')} filiações no sistema`
      },
      {
        key: 'filiacoesDesfiliadas',
        title: 'Filiações Desfiliadas',
        value: resumo.totalFiliacoesDesfiliadas,
        description: `de ${resumo.totalFiliacoes.toLocaleString('pt-BR')} filiações no sistema`
      },
      {
        key: 'filiacoesSemVinculoPessoa',
        title: 'Filiações sem Vínculo com Pessoa',
        value: resumo.totalFiliacoesSemVinculoPessoa,
        description: `de ${resumo.totalFiliacoes.toLocaleString('pt-BR')} filiações no sistema`
      }
    ],
    [resumo]
  );

  function openCardDetails(card: DashboardCard) {
    setSelectedCard(card);
    setSearchInput('');
    setSearchDebounced('');
    setDetailsPage(1);
    setDetalhes(initialDetalhes);
    setDetailsError('');
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
        <p className="text-sm text-slate-600">Indicadores iniciais da base sindical.</p>
      </header>

      <section className="ds-card">
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Visão por Pessoas</h2>
            <p className="text-xs text-slate-500">Indicadores consolidados de pessoas e filiações.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <button
              key={card.key}
              type="button"
              className="metric-card text-left transition hover:border-cyan-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              onClick={() => openCardDetails(card)}
            >
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-semibold text-sindata-900">
                <AnimatedMetricValue value={card.value} loading={loading} />
              </p>
              {card.description && !loading ? (
                <p className="mt-1 text-xs text-slate-500">{card.description}</p>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <section className="ds-card">
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Visão por Filiação</h2>
            <p className="text-xs text-slate-500">Indicadores consolidados por registros de filiação.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filiacaoCards.map((card) => (
            <button
              key={card.key}
              type="button"
              className="metric-card text-left transition hover:border-cyan-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              onClick={() => openCardDetails(card)}
            >
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-semibold text-sindata-900">
                <AnimatedMetricValue value={card.value} loading={loading} />
              </p>
              {card.description && !loading ? (
                <p className="mt-1 text-xs text-slate-500">{card.description}</p>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <article className="ds-card">
        <h2 className="text-lg font-semibold text-slate-900">Próximos passos</h2>
        <p className="mt-2 text-sm text-slate-600">
          Esta base já está pronta para evoluir com filtros avançados, relatórios detalhados e dashboards analíticos.
        </p>
      </article>

      {selectedCard ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4" onClick={() => setSelectedCard(null)}>
          <div
            className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedCard.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Lista em ordem alfabética, com filtro por CPF ou Nome contendo.
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setSelectedCard(null)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="form-input h-11 pl-9"
                  placeholder="Filtrar por CPF ou Nome (contendo)"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
              <p className="text-xs text-slate-500">
                {detalhes.pagination.total.toLocaleString('pt-BR')} registro(s) encontrado(s)
              </p>
            </div>

            {detailsError ? <div className="alert-error mt-4">{detailsError}</div> : null}

            <div className="mt-4 max-h-[55vh] overflow-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">CPF</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Nome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {detailsLoading ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-sm text-slate-500">
                        Carregando detalhes...
                      </td>
                    </tr>
                  ) : detalhes.items.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-sm text-slate-500">
                        Nenhum registro encontrado para este filtro.
                      </td>
                    </tr>
                  ) : (
                    detalhes.items.map((item, index) => (
                      <tr key={`${item.cpf}-${item.nome}-${index}`} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-700">{item.cpf}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{item.nome || 'Sem nome'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Página {detalhes.pagination.page} de {Math.max(detalhes.pagination.totalPages, 1)}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={detailsLoading || detalhes.pagination.page <= 1}
                  onClick={() => setDetailsPage((current) => Math.max(1, current - 1))}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={
                    detailsLoading ||
                    detalhes.pagination.totalPages === 0 ||
                    detalhes.pagination.page >= detalhes.pagination.totalPages
                  }
                  onClick={() =>
                    setDetailsPage((current) =>
                      detalhes.pagination.totalPages > 0
                        ? Math.min(detalhes.pagination.totalPages, current + 1)
                        : current
                    )
                  }
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
