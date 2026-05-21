import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Search, X } from 'lucide-react';
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

interface DashboardSexoDistribuicaoItem {
  genero: string;
  descricao: string;
  totalPessoasQtd: number;
  totalPessoasPercentual: number;
  pessoasFiliadasAtivasQtd: number;
  pessoasFiliadasAtivasPercentual: number;
  pessoasDesfiliadasQtd: number;
  pessoasDesfiliadasPercentual: number;
  pessoasSemRegistroFiliacaoQtd: number;
  pessoasSemRegistroFiliacaoPercentual: number;
}

interface DashboardSexoDistribuicaoResponse {
  items: DashboardSexoDistribuicaoItem[];
}

interface DashboardFiliacaoSituacaoDistribuicaoItem {
  codigo: string;
  descricao: string;
  totalFiliacoesQtd: number;
  totalFiliacoesPercentual: number;
}

interface DashboardFiliacaoSituacaoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoDistribuicaoItem[];
}

interface DashboardFiliacaoSituacaoSexoDistribuicaoItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  genero: string;
  generoDescricao: string;
  totalQtd: number;
  totalPercentual: number;
}

interface DashboardFiliacaoSituacaoSexoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoSexoDistribuicaoItem[];
}

interface DashboardFiliacaoSituacaoDesfiliadosDistribuicaoItem {
  codigo: string;
  descricao: string;
  totalDesfiliadosQtd: number;
  totalDesfiliadosPercentual: number;
}

interface DashboardFiliacaoSituacaoDesfiliadosDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoDesfiliadosDistribuicaoItem[];
}

interface DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  genero: string;
  generoDescricao: string;
  totalQtd: number;
  totalPercentual: number;
}

interface DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoItem[];
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

interface AnimatedInlineCountProps {
  value: number;
  loading: boolean;
}

interface AnimatedInlinePercentProps {
  value: number;
  loading: boolean;
}

interface SexoColorStyle {
  chipClassName: string;
  rowClassName: string;
}

interface SituacaoColorStyle {
  chipClassName: string;
  rowClassName: string;
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

function AnimatedInlineCount({ value, loading }: AnimatedInlineCountProps) {
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

function AnimatedInlinePercent({ value, loading }: AnimatedInlinePercentProps) {
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
      const nextValue = target * easedProgress;

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

  return <>{`${animatedValue.toFixed(2).replace('.', ',')}%`}</>;
}

export function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo>(initialResumo);
  const [loading, setLoading] = useState(true);
  const [sexoDistribuicaoLoading, setSexoDistribuicaoLoading] = useState(true);
  const [sexoDistribuicaoError, setSexoDistribuicaoError] = useState('');
  const [sexoDistribuicao, setSexoDistribuicao] = useState<DashboardSexoDistribuicaoItem[]>([]);
  const [sexoDistribuicaoExpandida, setSexoDistribuicaoExpandida] = useState(false);
  const [filiacaoSituacaoDistribuicaoLoading, setFiliacaoSituacaoDistribuicaoLoading] = useState(true);
  const [filiacaoSituacaoDistribuicaoError, setFiliacaoSituacaoDistribuicaoError] = useState('');
  const [filiacaoSituacaoDistribuicao, setFiliacaoSituacaoDistribuicao] = useState<
    DashboardFiliacaoSituacaoDistribuicaoItem[]
  >([]);
  const [filiacaoSituacaoExpandida, setFiliacaoSituacaoExpandida] = useState(false);
  const [filiacaoSituacaoSexoDistribuicaoLoading, setFiliacaoSituacaoSexoDistribuicaoLoading] = useState(true);
  const [filiacaoSituacaoSexoDistribuicaoError, setFiliacaoSituacaoSexoDistribuicaoError] = useState('');
  const [filiacaoSituacaoSexoDistribuicao, setFiliacaoSituacaoSexoDistribuicao] = useState<
    DashboardFiliacaoSituacaoSexoDistribuicaoItem[]
  >([]);
  const [filiacaoSituacaoSexoAberta, setFiliacaoSituacaoSexoAberta] = useState('');
  const [filiacaoSituacaoDesfiliadosLoading, setFiliacaoSituacaoDesfiliadosLoading] = useState(true);
  const [filiacaoSituacaoDesfiliadosError, setFiliacaoSituacaoDesfiliadosError] = useState('');
  const [filiacaoSituacaoDesfiliados, setFiliacaoSituacaoDesfiliados] = useState<
    DashboardFiliacaoSituacaoDesfiliadosDistribuicaoItem[]
  >([]);
  const [filiacaoSituacaoDesfiliadosExpandida, setFiliacaoSituacaoDesfiliadosExpandida] = useState(false);
  const [filiacaoSituacaoDesfiliadosSexoLoading, setFiliacaoSituacaoDesfiliadosSexoLoading] = useState(true);
  const [filiacaoSituacaoDesfiliadosSexoError, setFiliacaoSituacaoDesfiliadosSexoError] = useState('');
  const [filiacaoSituacaoDesfiliadosSexo, setFiliacaoSituacaoDesfiliadosSexo] = useState<
    DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoItem[]
  >([]);
  const [filiacaoSituacaoDesfiliadosSexoAberta, setFiliacaoSituacaoDesfiliadosSexoAberta] = useState('');
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
    async function loadSexoDistribuicao() {
      setSexoDistribuicaoLoading(true);
      setSexoDistribuicaoError('');

      try {
        const response = await api.get<{ data: DashboardSexoDistribuicaoResponse }>('/dashboard/sexo-distribuicao');
        setSexoDistribuicao(response.data.data.items ?? []);
      } catch {
        setSexoDistribuicao([]);
        setSexoDistribuicaoError('Não foi possível carregar a distribuição por sexo.');
      } finally {
        setSexoDistribuicaoLoading(false);
      }
    }

    void loadSexoDistribuicao();
  }, []);

  useEffect(() => {
    async function loadFiliacaoSituacaoDistribuicao() {
      setFiliacaoSituacaoDistribuicaoLoading(true);
      setFiliacaoSituacaoDistribuicaoError('');

      try {
        const response = await api.get<{ data: DashboardFiliacaoSituacaoDistribuicaoResponse }>(
          '/dashboard/filiacao-situacao-distribuicao'
        );
        setFiliacaoSituacaoDistribuicao(response.data.data.items ?? []);
      } catch {
        setFiliacaoSituacaoDistribuicao([]);
        setFiliacaoSituacaoDistribuicaoError('Não foi possível carregar a distribuição por situação funcional.');
      } finally {
        setFiliacaoSituacaoDistribuicaoLoading(false);
      }
    }

    void loadFiliacaoSituacaoDistribuicao();
  }, []);

  useEffect(() => {
    async function loadFiliacaoSituacaoSexoDistribuicao() {
      setFiliacaoSituacaoSexoDistribuicaoLoading(true);
      setFiliacaoSituacaoSexoDistribuicaoError('');

      try {
        const response = await api.get<{ data: DashboardFiliacaoSituacaoSexoDistribuicaoResponse }>(
          '/dashboard/filiacao-situacao-sexo-distribuicao'
        );
        setFiliacaoSituacaoSexoDistribuicao(response.data.data.items ?? []);
      } catch {
        setFiliacaoSituacaoSexoDistribuicao([]);
        setFiliacaoSituacaoSexoDistribuicaoError(
          'Não foi possível carregar a distribuição por sexo na situação funcional.'
        );
      } finally {
        setFiliacaoSituacaoSexoDistribuicaoLoading(false);
      }
    }

    void loadFiliacaoSituacaoSexoDistribuicao();
  }, []);

  useEffect(() => {
    async function loadFiliacaoSituacaoDesfiliados() {
      setFiliacaoSituacaoDesfiliadosLoading(true);
      setFiliacaoSituacaoDesfiliadosError('');

      try {
        const response = await api.get<{ data: DashboardFiliacaoSituacaoDesfiliadosDistribuicaoResponse }>(
          '/dashboard/filiacao-situacao-desfiliados-distribuicao'
        );
        setFiliacaoSituacaoDesfiliados(response.data.data.items ?? []);
      } catch {
        setFiliacaoSituacaoDesfiliados([]);
        setFiliacaoSituacaoDesfiliadosError(
          'Não foi possível carregar a distribuição por situação de filiações desfiliadas.'
        );
      } finally {
        setFiliacaoSituacaoDesfiliadosLoading(false);
      }
    }

    void loadFiliacaoSituacaoDesfiliados();
  }, []);

  useEffect(() => {
    async function loadFiliacaoSituacaoDesfiliadosSexo() {
      setFiliacaoSituacaoDesfiliadosSexoLoading(true);
      setFiliacaoSituacaoDesfiliadosSexoError('');

      try {
        const response = await api.get<{ data: DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoResponse }>(
          '/dashboard/filiacao-situacao-desfiliados-sexo-distribuicao'
        );
        setFiliacaoSituacaoDesfiliadosSexo(response.data.data.items ?? []);
      } catch {
        setFiliacaoSituacaoDesfiliadosSexo([]);
        setFiliacaoSituacaoDesfiliadosSexoError(
          'NÃ£o foi possÃ­vel carregar a distribuiÃ§Ã£o por sexo na situaÃ§Ã£o de filiaÃ§Ãµes desfiliadas.'
        );
      } finally {
        setFiliacaoSituacaoDesfiliadosSexoLoading(false);
      }
    }

    void loadFiliacaoSituacaoDesfiliadosSexo();
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

  function getGeneroColorStyle(descricao: string, codigo: string): SexoColorStyle {
    const normalized = `${descricao} ${codigo}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes('feminino')) {
      return {
        chipClassName: 'border-rose-200 bg-rose-50 text-rose-700',
        rowClassName: 'hover:bg-rose-50/40'
      };
    }

    if (normalized.includes('masculino')) {
      return {
        chipClassName: 'border-sky-200 bg-sky-50 text-sky-700',
        rowClassName: 'hover:bg-sky-50/40'
      };
    }

    if (normalized.includes('nao binario') || normalized.includes('nao-binario')) {
      return {
        chipClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        rowClassName: 'hover:bg-emerald-50/40'
      };
    }

    return {
      chipClassName: 'border-slate-200 bg-slate-50 text-slate-700',
      rowClassName: 'hover:bg-slate-50'
    };
  }

  function getSexoColorStyle(item: DashboardSexoDistribuicaoItem): SexoColorStyle {
    return getGeneroColorStyle(item.descricao, item.genero);
  }

  function getFiliacaoSituacaoColorStyle(item: DashboardFiliacaoSituacaoDistribuicaoItem): SituacaoColorStyle {
    const normalized = `${item.descricao} ${item.codigo}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (normalized.includes('ativo')) {
      return {
        chipClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        rowClassName: 'hover:bg-emerald-50/40'
      };
    }

    if (normalized.includes('aposent')) {
      return {
        chipClassName: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        rowClassName: 'hover:bg-indigo-50/40'
      };
    }

    if (normalized.includes('desfiliad') || normalized.includes('demitid')) {
      return {
        chipClassName: 'border-rose-200 bg-rose-50 text-rose-700',
        rowClassName: 'hover:bg-rose-50/40'
      };
    }

    if (normalized.includes('falec')) {
      return {
        chipClassName: 'border-slate-300 bg-slate-100 text-slate-700',
        rowClassName: 'hover:bg-slate-100/70'
      };
    }

    if (normalized.includes('licenca')) {
      return {
        chipClassName: 'border-amber-200 bg-amber-50 text-amber-700',
        rowClassName: 'hover:bg-amber-50/40'
      };
    }

    if (normalized.includes('inquerit')) {
      return {
        chipClassName: 'border-violet-200 bg-violet-50 text-violet-700',
        rowClassName: 'hover:bg-violet-50/40'
      };
    }

    if (normalized.includes('cedido')) {
      return {
        chipClassName: 'border-cyan-200 bg-cyan-50 text-cyan-700',
        rowClassName: 'hover:bg-cyan-50/40'
      };
    }

    if (normalized.includes('tratamento') || normalized.includes('saude')) {
      return {
        chipClassName: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
        rowClassName: 'hover:bg-fuchsia-50/40'
      };
    }

    return {
      chipClassName: 'border-slate-200 bg-slate-50 text-slate-700',
      rowClassName: 'hover:bg-slate-50'
    };
  }

  const filiacaoSituacaoSexoPorCodigo = useMemo(() => {
    return filiacaoSituacaoSexoDistribuicao.reduce<Record<string, DashboardFiliacaoSituacaoSexoDistribuicaoItem[]>>(
      (acc, item) => {
        const key = item.situacaoCodigo;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {}
    );
  }, [filiacaoSituacaoSexoDistribuicao]);

  const filiacaoSituacaoDesfiliadosSexoPorCodigo = useMemo(() => {
    return filiacaoSituacaoDesfiliadosSexo.reduce<
      Record<string, DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoItem[]>
    >((acc, item) => {
      const key = item.situacaoCodigo;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [filiacaoSituacaoDesfiliadosSexo]);

  function toggleDetalheSexoSituacao(codigo: string) {
    setFiliacaoSituacaoSexoAberta((current) => (current === codigo ? '' : codigo));
  }

  function toggleDetalheSexoSituacaoDesfiliados(codigo: string) {
    setFiliacaoSituacaoDesfiliadosSexoAberta((current) => (current === codigo ? '' : codigo));
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

        <article className="metric-card mt-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Distribuição por Sexo</h3>
              <p className="text-xs text-slate-500">
                Quantidade e percentual por sexo em Total de Pessoas, Pessoas Filiadas Ativas, Pessoas Desfiliadas e
                Pessoas sem Registro de Filiação.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              aria-expanded={sexoDistribuicaoExpandida}
              aria-controls="distribuicao-sexo-conteudo"
              onClick={() => setSexoDistribuicaoExpandida((current) => !current)}
            >
              {sexoDistribuicaoExpandida ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {sexoDistribuicaoExpandida ? 'Minimizar' : 'Maximizar'}
            </button>
          </div>

          {sexoDistribuicaoExpandida ? (
            <div id="distribuicao-sexo-conteudo" className="space-y-3">
              {sexoDistribuicaoError ? <div className="alert-error">{sexoDistribuicaoError}</div> : null}

              <div className="overflow-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Sexo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Total de Pessoas
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Pessoas Filiadas Ativas
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Pessoas Desfiliadas
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Pessoas sem Registro de Filiação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sexoDistribuicaoLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                          Carregando distribuição por sexo...
                        </td>
                      </tr>
                    ) : sexoDistribuicao.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                          Nenhum sexo encontrado para exibição.
                        </td>
                      </tr>
                    ) : (
                      sexoDistribuicao.map((item) => {
                        const sexoStyle = getSexoColorStyle(item);
                        return (
                          <tr key={`${item.genero}-${item.descricao}`} className={sexoStyle.rowClassName}>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${sexoStyle.chipClassName}`}
                              >
                                {item.descricao || item.genero || 'Não informado'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              <AnimatedInlineCount value={item.totalPessoasQtd} loading={sexoDistribuicaoLoading} /> (
                              <AnimatedInlinePercent value={item.totalPessoasPercentual} loading={sexoDistribuicaoLoading} />)
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              <AnimatedInlineCount value={item.pessoasFiliadasAtivasQtd} loading={sexoDistribuicaoLoading} /> (
                              <AnimatedInlinePercent
                                value={item.pessoasFiliadasAtivasPercentual}
                                loading={sexoDistribuicaoLoading}
                              />
                              )
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              <AnimatedInlineCount value={item.pessoasDesfiliadasQtd} loading={sexoDistribuicaoLoading} /> (
                              <AnimatedInlinePercent
                                value={item.pessoasDesfiliadasPercentual}
                                loading={sexoDistribuicaoLoading}
                              />
                              )
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              <AnimatedInlineCount
                                value={item.pessoasSemRegistroFiliacaoQtd}
                                loading={sexoDistribuicaoLoading}
                              />{' '}
                              (
                              <AnimatedInlinePercent
                                value={item.pessoasSemRegistroFiliacaoPercentual}
                                loading={sexoDistribuicaoLoading}
                              />
                              )
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </article>
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

        <article className="metric-card mt-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Situação Funcional da Filiação</h3>
              <p className="text-xs text-slate-500">
                Quantidade e percentual por situação da filiação, considerando apenas situações ativas no cadastro.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              aria-expanded={filiacaoSituacaoExpandida}
              aria-controls="filiacao-situacao-conteudo"
              onClick={() => setFiliacaoSituacaoExpandida((current) => !current)}
            >
              {filiacaoSituacaoExpandida ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {filiacaoSituacaoExpandida ? 'Minimizar' : 'Maximizar'}
            </button>
          </div>

          {filiacaoSituacaoExpandida ? (
            <div id="filiacao-situacao-conteudo" className="space-y-3">
              {filiacaoSituacaoDistribuicaoError ? (
                <div className="alert-error">{filiacaoSituacaoDistribuicaoError}</div>
              ) : null}

              <div className="overflow-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Situação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Total de Filiações
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Sexo por Situação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filiacaoSituacaoDistribuicaoLoading ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                          Carregando distribuição por situação funcional...
                        </td>
                      </tr>
                    ) : filiacaoSituacaoDistribuicao.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                          Nenhuma situação funcional encontrada para exibição.
                        </td>
                      </tr>
                    ) : (
                      filiacaoSituacaoDistribuicao.map((item) => {
                        const situacaoStyle = getFiliacaoSituacaoColorStyle(item);
                        const situacaoEstaAberta = filiacaoSituacaoSexoAberta === item.codigo;
                        const sexoDaSituacao = filiacaoSituacaoSexoPorCodigo[item.codigo] ?? [];
                        return (
                          <Fragment key={`${item.codigo}-${item.descricao}`}>
                            <tr className={situacaoStyle.rowClassName}>
                              <td className="px-4 py-3 text-sm text-slate-700">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${situacaoStyle.chipClassName}`}
                                >
                                  {item.descricao || item.codigo || 'Não informado'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-700">
                                <AnimatedInlineCount
                                  value={item.totalFiliacoesQtd}
                                  loading={filiacaoSituacaoDistribuicaoLoading}
                                />{' '}
                                (
                                <AnimatedInlinePercent
                                  value={item.totalFiliacoesPercentual}
                                  loading={filiacaoSituacaoDistribuicaoLoading}
                                />
                                )
                              </td>
                              <td className="px-4 py-3 text-right text-sm text-slate-700">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                                  aria-expanded={situacaoEstaAberta}
                                  aria-label={`Ver distribuição por sexo da situação ${item.descricao || item.codigo}`}
                                  onClick={() => toggleDetalheSexoSituacao(item.codigo)}
                                >
                                  {situacaoEstaAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  {situacaoEstaAberta ? 'Ocultar' : 'Ver sexo'}
                                </button>
                              </td>
                            </tr>
                            {situacaoEstaAberta ? (
                              <tr>
                                <td colSpan={3} className="bg-slate-50/50 px-4 py-3">
                                  {filiacaoSituacaoSexoDistribuicaoError ? (
                                    <div className="alert-error">{filiacaoSituacaoSexoDistribuicaoError}</div>
                                  ) : filiacaoSituacaoSexoDistribuicaoLoading ? (
                                    <p className="text-sm text-slate-500">Carregando distribuição por sexo...</p>
                                  ) : sexoDaSituacao.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                      Nenhum dado de distribuição por sexo encontrado para esta situação.
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                      {sexoDaSituacao.map((sexoItem) => {
                                        const generoStyle = getGeneroColorStyle(
                                          sexoItem.generoDescricao,
                                          sexoItem.genero
                                        );
                                        return (
                                          <div
                                            key={`${sexoItem.situacaoCodigo}-${sexoItem.genero}`}
                                            className="rounded-lg border border-slate-200 bg-white p-3"
                                          >
                                            <span
                                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${generoStyle.chipClassName}`}
                                            >
                                              {sexoItem.generoDescricao || sexoItem.genero || 'Não informado'}
                                            </span>
                                            <p className="mt-2 text-sm font-medium text-slate-700">
                                              <AnimatedInlineCount
                                                value={sexoItem.totalQtd}
                                                loading={filiacaoSituacaoSexoDistribuicaoLoading}
                                              />{' '}
                                              (
                                              <AnimatedInlinePercent
                                                value={sexoItem.totalPercentual}
                                                loading={filiacaoSituacaoSexoDistribuicaoLoading}
                                              />
                                              )
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </article>

        <article className="metric-card mt-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Situação dos Desfiliados</h3>
              <p className="text-xs text-slate-500">
                Quantidade e percentual por situação dos desfiliados, considerando apenas desfiliados no cadastro.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              aria-expanded={filiacaoSituacaoDesfiliadosExpandida}
              aria-controls="filiacao-situacao-desfiliados-conteudo"
              onClick={() => setFiliacaoSituacaoDesfiliadosExpandida((current) => !current)}
            >
              {filiacaoSituacaoDesfiliadosExpandida ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {filiacaoSituacaoDesfiliadosExpandida ? 'Minimizar' : 'Maximizar'}
            </button>
          </div>

          {filiacaoSituacaoDesfiliadosExpandida ? (
            <div id="filiacao-situacao-desfiliados-conteudo" className="space-y-3">
              {filiacaoSituacaoDesfiliadosError ? (
                <div className="alert-error">{filiacaoSituacaoDesfiliadosError}</div>
              ) : null}

              <div className="overflow-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Situação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Total de Desfiliados
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Sexo por Situação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filiacaoSituacaoDesfiliadosLoading ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                          Carregando distribuição de desfiliados...
                        </td>
                      </tr>
                    ) : filiacaoSituacaoDesfiliados.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                          Nenhuma situação de desfiliados encontrada para exibição.
                        </td>
                      </tr>
                    ) : (
                      filiacaoSituacaoDesfiliados.map((item) => {
                        const situacaoStyle = getFiliacaoSituacaoColorStyle({
                          codigo: item.codigo,
                          descricao: item.descricao,
                          totalFiliacoesQtd: 0,
                          totalFiliacoesPercentual: 0
                        });
                        const situacaoEstaAberta = filiacaoSituacaoDesfiliadosSexoAberta === item.codigo;
                        const sexoDaSituacao = filiacaoSituacaoDesfiliadosSexoPorCodigo[item.codigo] ?? [];

                        return (
                          <Fragment key={`${item.codigo}-${item.descricao}`}>
                            <tr className={situacaoStyle.rowClassName}>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${situacaoStyle.chipClassName}`}
                              >
                                {item.descricao || item.codigo || 'Não informado'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              <AnimatedInlineCount
                                value={item.totalDesfiliadosQtd}
                                loading={filiacaoSituacaoDesfiliadosLoading}
                              />{' '}
                              (
                              <AnimatedInlinePercent
                                value={item.totalDesfiliadosPercentual}
                                loading={filiacaoSituacaoDesfiliadosLoading}
                              />
                              )
                            </td>
                              <td className="px-4 py-3 text-right text-sm text-slate-700">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                                  aria-expanded={situacaoEstaAberta}
                                  aria-label={`Ver distribuiÃ§Ã£o por sexo da situaÃ§Ã£o ${item.descricao || item.codigo}`}
                                  onClick={() => toggleDetalheSexoSituacaoDesfiliados(item.codigo)}
                                >
                                  {situacaoEstaAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  {situacaoEstaAberta ? 'Ocultar' : 'Ver sexo'}
                                </button>
                              </td>
                            </tr>
                            {situacaoEstaAberta ? (
                              <tr>
                                <td colSpan={3} className="bg-slate-50/50 px-4 py-3">
                                  {filiacaoSituacaoDesfiliadosSexoError ? (
                                    <div className="alert-error">{filiacaoSituacaoDesfiliadosSexoError}</div>
                                  ) : filiacaoSituacaoDesfiliadosSexoLoading ? (
                                    <p className="text-sm text-slate-500">Carregando distribuiÃ§Ã£o por sexo...</p>
                                  ) : sexoDaSituacao.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                      Nenhum dado de distribuiÃ§Ã£o por sexo encontrado para esta situaÃ§Ã£o.
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                      {sexoDaSituacao.map((sexoItem) => {
                                        const generoStyle = getGeneroColorStyle(
                                          sexoItem.generoDescricao,
                                          sexoItem.genero
                                        );
                                        return (
                                          <div
                                            key={`${sexoItem.situacaoCodigo}-${sexoItem.genero}`}
                                            className="rounded-lg border border-slate-200 bg-white p-3"
                                          >
                                            <span
                                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${generoStyle.chipClassName}`}
                                            >
                                              {sexoItem.generoDescricao || sexoItem.genero || 'NÃ£o informado'}
                                            </span>
                                            <p className="mt-2 text-sm font-medium text-slate-700">
                                              <AnimatedInlineCount
                                                value={sexoItem.totalQtd}
                                                loading={filiacaoSituacaoDesfiliadosSexoLoading}
                                              />{' '}
                                              (
                                              <AnimatedInlinePercent
                                                value={sexoItem.totalPercentual}
                                                loading={filiacaoSituacaoDesfiliadosSexoLoading}
                                              />
                                              )
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </article>
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
