import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Search, X } from 'lucide-react';
import api from '../../../services/api';
import { ConsignacoesSection } from '../components/ConsignacoesSection';
import { MetricDescriptionSkeleton, MetricValueSkeleton, PanelSkeleton, TableRowsSkeleton } from '../components/DashboardSkeleton';

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

interface DashboardFiliacaoSituacaoSexoInconsistenciaItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  cpf: string;
  nome: string;
  motivo: string;
}

interface DashboardFiliacaoSituacaoSexoInconsistenciasResponse {
  items: DashboardFiliacaoSituacaoSexoInconsistenciaItem[];
}

interface DashboardFiliacaoSituacaoRegiaoDistribuicaoItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  regiaoCodigo: string;
  regiaoDescricao: string;
  totalQtd: number;
  totalPercentual: number;
}

interface DashboardFiliacaoSituacaoRegiaoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoRegiaoDistribuicaoItem[];
}

interface DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoItem {
  esfera: string;
  totalQtd: number;
  totalPercentual: number;
}

interface DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoItem[];
}

interface DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoItem {
  esfera: string;
  genero: string;
  generoDescricao: string;
  totalQtd: number;
  totalPercentual: number;
}

interface DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoItem[];
}

interface DashboardFiliacaoSituacaoRegiaoInconsistenciaItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  cpf: string;
  nome: string;
  motivo: string;
}

interface DashboardFiliacaoSituacaoRegiaoInconsistenciasResponse {
  items: DashboardFiliacaoSituacaoRegiaoInconsistenciaItem[];
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

interface DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciaItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  cpf: string;
  nome: string;
  motivo: string;
}

interface DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciasResponse {
  items: DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciaItem[];
}

interface DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  regiaoCodigo: string;
  regiaoDescricao: string;
  totalQtd: number;
  totalPercentual: number;
}

interface DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoItem[];
}

interface DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  cpf: string;
  nome: string;
  motivo: string;
}

interface DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasResponse {
  items: DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaItem[];
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
    return <MetricValueSkeleton />;
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
    return <SkeletonInline />;
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
    return <SkeletonInline />;
  }

  return <>{`${animatedValue.toFixed(2).replace('.', ',')}%`}</>;
}

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

function SkeletonInline() {
  return <span className="inline-block h-4 w-12 animate-pulse rounded bg-slate-200/80 align-middle" />;
}

interface AnimatedPieChartProps {
  slices: PieSlice[];
  loading: boolean;
}

function AnimatedPieChart({ slices, loading }: AnimatedPieChartProps) {
  const [progress, setProgress] = useState(0);
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((acc, slice) => acc + Math.max(0, slice.value), 0);
  const signature = slices.map((slice) => `${slice.label}:${slice.value}`).join('|');

  useEffect(() => {
    if (loading) {
      setProgress(0);
      return;
    }

    const durationMs = 850;
    const start = performance.now();
    let rafId = 0;

    setProgress(0);
    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;
      const normalized = Math.min(elapsed / durationMs, 1);
      const eased = 1 - (1 - normalized) ** 3;
      setProgress(eased);

      if (normalized < 1) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [loading, signature]);

  let accumulated = 0;

  return (
    <div className="mx-auto flex w-full max-w-[260px] flex-col items-center">
      <svg viewBox="0 0 220 220" className="h-52 w-52">
        <circle cx="110" cy="110" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="28" />
        {total > 0
          ? slices.map((slice) => {
              const safeValue = Math.max(0, slice.value);
              const ratio = safeValue / total;
              const baseLength = ratio * circumference;
              const animatedLength = baseLength * progress;
              const dashOffset = -accumulated;
              accumulated += baseLength;

              return (
                <circle
                  key={slice.label}
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="28"
                  strokeLinecap="butt"
                  transform="rotate(-90 110 110)"
                  strokeDasharray={`${animatedLength} ${circumference}`}
                  strokeDashoffset={dashOffset}
                />
              );
            })
          : null}
        <circle cx="110" cy="110" r="44" fill="white" />
        <text x="110" y="104" textAnchor="middle" className="fill-slate-500 text-[10px] font-semibold uppercase tracking-wide">
          Total
        </text>
        <text x="110" y="124" textAnchor="middle" className="fill-slate-800 text-[15px] font-bold">
          {total.toLocaleString('pt-BR')}
        </text>
      </svg>
    </div>
  );
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
  const [filiacaoSituacaoSexoInconsistenciasLoading, setFiliacaoSituacaoSexoInconsistenciasLoading] = useState(true);
  const [filiacaoSituacaoSexoInconsistenciasError, setFiliacaoSituacaoSexoInconsistenciasError] = useState('');
  const [filiacaoSituacaoSexoInconsistencias, setFiliacaoSituacaoSexoInconsistencias] = useState<
    DashboardFiliacaoSituacaoSexoInconsistenciaItem[]
  >([]);
  const [filiacaoSituacaoSexoInconsistenciaAberta, setFiliacaoSituacaoSexoInconsistenciaAberta] = useState('');
  const [filiacaoSituacaoRegiaoDistribuicaoLoading, setFiliacaoSituacaoRegiaoDistribuicaoLoading] = useState(true);
  const [filiacaoSituacaoRegiaoDistribuicaoError, setFiliacaoSituacaoRegiaoDistribuicaoError] = useState('');
  const [filiacaoSituacaoRegiaoDistribuicao, setFiliacaoSituacaoRegiaoDistribuicao] = useState<
    DashboardFiliacaoSituacaoRegiaoDistribuicaoItem[]
  >([]);
  const [filiacaoSituacaoRegiaoEsferaModal, setFiliacaoSituacaoRegiaoEsferaModal] = useState<{
    origem: 'ativos' | 'desfiliados';
    situacaoCodigo: string;
    situacaoDescricao: string;
    regiaoCodigo: string;
    regiaoDescricao: string;
  } | null>(null);
  const [filiacaoSituacaoRegiaoEsferaLoading, setFiliacaoSituacaoRegiaoEsferaLoading] = useState(false);
  const [filiacaoSituacaoRegiaoEsferaError, setFiliacaoSituacaoRegiaoEsferaError] = useState('');
  const [filiacaoSituacaoRegiaoEsferaDistribuicao, setFiliacaoSituacaoRegiaoEsferaDistribuicao] = useState<
    DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoItem[]
  >([]);
  const [filiacaoSituacaoRegiaoEsferaSexoAberta, setFiliacaoSituacaoRegiaoEsferaSexoAberta] = useState('');
  const [filiacaoSituacaoRegiaoEsferaSexoLoading, setFiliacaoSituacaoRegiaoEsferaSexoLoading] = useState(false);
  const [filiacaoSituacaoRegiaoEsferaSexoError, setFiliacaoSituacaoRegiaoEsferaSexoError] = useState('');
  const [filiacaoSituacaoRegiaoEsferaSexoDistribuicao, setFiliacaoSituacaoRegiaoEsferaSexoDistribuicao] = useState<
    DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoItem[]
  >([]);
  const [filiacaoSituacaoRegiaoAberta, setFiliacaoSituacaoRegiaoAberta] = useState('');
  const [filiacaoSituacaoRegiaoInconsistenciasLoading, setFiliacaoSituacaoRegiaoInconsistenciasLoading] =
    useState(true);
  const [filiacaoSituacaoRegiaoInconsistenciasError, setFiliacaoSituacaoRegiaoInconsistenciasError] = useState('');
  const [filiacaoSituacaoRegiaoInconsistencias, setFiliacaoSituacaoRegiaoInconsistencias] = useState<
    DashboardFiliacaoSituacaoRegiaoInconsistenciaItem[]
  >([]);
  const [filiacaoSituacaoRegiaoInconsistenciaAberta, setFiliacaoSituacaoRegiaoInconsistenciaAberta] = useState('');
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
  const [filiacaoSituacaoDesfiliadosSexoInconsistenciasLoading, setFiliacaoSituacaoDesfiliadosSexoInconsistenciasLoading] =
    useState(true);
  const [filiacaoSituacaoDesfiliadosSexoInconsistenciasError, setFiliacaoSituacaoDesfiliadosSexoInconsistenciasError] =
    useState('');
  const [filiacaoSituacaoDesfiliadosSexoInconsistencias, setFiliacaoSituacaoDesfiliadosSexoInconsistencias] =
    useState<DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciaItem[]>([]);
  const [filiacaoSituacaoDesfiliadosSexoInconsistenciaAberta, setFiliacaoSituacaoDesfiliadosSexoInconsistenciaAberta] =
    useState('');
  const [filiacaoSituacaoDesfiliadosRegiaoLoading, setFiliacaoSituacaoDesfiliadosRegiaoLoading] = useState(true);
  const [filiacaoSituacaoDesfiliadosRegiaoError, setFiliacaoSituacaoDesfiliadosRegiaoError] = useState('');
  const [filiacaoSituacaoDesfiliadosRegiao, setFiliacaoSituacaoDesfiliadosRegiao] = useState<
    DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoItem[]
  >([]);
  const [filiacaoSituacaoDesfiliadosRegiaoAberta, setFiliacaoSituacaoDesfiliadosRegiaoAberta] = useState('');
  const [filiacaoSituacaoDesfiliadosRegiaoInconsistenciasLoading, setFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasLoading] =
    useState(true);
  const [filiacaoSituacaoDesfiliadosRegiaoInconsistenciasError, setFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasError] =
    useState('');
  const [filiacaoSituacaoDesfiliadosRegiaoInconsistencias, setFiliacaoSituacaoDesfiliadosRegiaoInconsistencias] =
    useState<DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaItem[]>([]);
  const [filiacaoSituacaoDesfiliadosRegiaoInconsistenciaAberta, setFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaAberta] =
    useState('');
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
    async function loadFiliacaoSituacaoSexoInconsistencias() {
      setFiliacaoSituacaoSexoInconsistenciasLoading(true);
      setFiliacaoSituacaoSexoInconsistenciasError('');

      try {
        const response = await api.get<{ data: DashboardFiliacaoSituacaoSexoInconsistenciasResponse }>(
          '/dashboard/filiacao-situacao-sexo-inconsistencias'
        );
        setFiliacaoSituacaoSexoInconsistencias(response.data.data.items ?? []);
      } catch {
        setFiliacaoSituacaoSexoInconsistencias([]);
        setFiliacaoSituacaoSexoInconsistenciasError(
          'Não foi possível carregar as inconsistências de sexo na situação funcional.'
        );
      } finally {
        setFiliacaoSituacaoSexoInconsistenciasLoading(false);
      }
    }

    void loadFiliacaoSituacaoSexoInconsistencias();
  }, []);

  useEffect(() => {
    async function loadFiliacaoSituacaoRegiaoDistribuicao() {
      setFiliacaoSituacaoRegiaoDistribuicaoLoading(true);
      setFiliacaoSituacaoRegiaoDistribuicaoError('');

      try {
        const response = await api.get<{ data: DashboardFiliacaoSituacaoRegiaoDistribuicaoResponse }>(
          '/dashboard/filiacao-situacao-regiao-distribuicao'
        );
        setFiliacaoSituacaoRegiaoDistribuicao(response.data.data.items ?? []);
      } catch {
        setFiliacaoSituacaoRegiaoDistribuicao([]);
        setFiliacaoSituacaoRegiaoDistribuicaoError(
          'Não foi possível carregar a distribuição por região na situação funcional.'
        );
      } finally {
        setFiliacaoSituacaoRegiaoDistribuicaoLoading(false);
      }
    }

    void loadFiliacaoSituacaoRegiaoDistribuicao();
  }, []);

  useEffect(() => {
    async function loadFiliacaoSituacaoRegiaoInconsistencias() {
      setFiliacaoSituacaoRegiaoInconsistenciasLoading(true);
      setFiliacaoSituacaoRegiaoInconsistenciasError('');

      try {
        const response = await api.get<{ data: DashboardFiliacaoSituacaoRegiaoInconsistenciasResponse }>(
          '/dashboard/filiacao-situacao-regiao-inconsistencias'
        );
        setFiliacaoSituacaoRegiaoInconsistencias(response.data.data.items ?? []);
      } catch {
        setFiliacaoSituacaoRegiaoInconsistencias([]);
        setFiliacaoSituacaoRegiaoInconsistenciasError(
          'Não foi possível carregar as inconsistências de região na situação funcional.'
        );
      } finally {
        setFiliacaoSituacaoRegiaoInconsistenciasLoading(false);
      }
    }

    void loadFiliacaoSituacaoRegiaoInconsistencias();
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
          'Não foi possível carregar a distribuição por sexo na situação de filiações desfiliadas.'
        );
      } finally {
        setFiliacaoSituacaoDesfiliadosSexoLoading(false);
      }
    }

    void loadFiliacaoSituacaoDesfiliadosSexo();
  }, []);

  useEffect(() => {
    async function loadFiliacaoSituacaoDesfiliadosSexoInconsistencias() {
      setFiliacaoSituacaoDesfiliadosSexoInconsistenciasLoading(true);
      setFiliacaoSituacaoDesfiliadosSexoInconsistenciasError('');

      try {
        const response = await api.get<{ data: DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciasResponse }>(
          '/dashboard/filiacao-situacao-desfiliados-sexo-inconsistencias'
        );
        setFiliacaoSituacaoDesfiliadosSexoInconsistencias(response.data.data.items ?? []);
      } catch {
        setFiliacaoSituacaoDesfiliadosSexoInconsistencias([]);
        setFiliacaoSituacaoDesfiliadosSexoInconsistenciasError(
          'Não foi possível carregar as inconsistências de sexo na situação dos desfiliados.'
        );
      } finally {
        setFiliacaoSituacaoDesfiliadosSexoInconsistenciasLoading(false);
      }
    }

    void loadFiliacaoSituacaoDesfiliadosSexoInconsistencias();
  }, []);

  useEffect(() => {
    async function loadFiliacaoSituacaoDesfiliadosRegiao() {
      setFiliacaoSituacaoDesfiliadosRegiaoLoading(true);
      setFiliacaoSituacaoDesfiliadosRegiaoError('');

      try {
        const response = await api.get<{ data: DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoResponse }>(
          '/dashboard/filiacao-situacao-desfiliados-regiao-distribuicao'
        );
        setFiliacaoSituacaoDesfiliadosRegiao(response.data.data.items ?? []);
      } catch {
        setFiliacaoSituacaoDesfiliadosRegiao([]);
        setFiliacaoSituacaoDesfiliadosRegiaoError(
          'Não foi possível carregar a distribuição por região na situação dos desfiliados.'
        );
      } finally {
        setFiliacaoSituacaoDesfiliadosRegiaoLoading(false);
      }
    }

    void loadFiliacaoSituacaoDesfiliadosRegiao();
  }, []);

  useEffect(() => {
    async function loadFiliacaoSituacaoDesfiliadosRegiaoInconsistencias() {
      setFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasLoading(true);
      setFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasError('');

      try {
        const response = await api.get<{ data: DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasResponse }>(
          '/dashboard/filiacao-situacao-desfiliados-regiao-inconsistencias'
        );
        setFiliacaoSituacaoDesfiliadosRegiaoInconsistencias(response.data.data.items ?? []);
      } catch {
        setFiliacaoSituacaoDesfiliadosRegiaoInconsistencias([]);
        setFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasError(
          'Não foi possível carregar as inconsistências de região na situação dos desfiliados.'
        );
      } finally {
        setFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasLoading(false);
      }
    }

    void loadFiliacaoSituacaoDesfiliadosRegiaoInconsistencias();
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
    if (!selectedCard && !filiacaoSituacaoRegiaoEsferaModal) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedCard(null);
        setFiliacaoSituacaoRegiaoEsferaModal(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedCard, filiacaoSituacaoRegiaoEsferaModal]);

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
        const key = String(item.situacaoCodigo ?? '').trim();
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {}
    );
  }, [filiacaoSituacaoSexoDistribuicao]);

  const filiacaoSituacaoSexoInconsistenciasPorCodigo = useMemo(() => {
    return filiacaoSituacaoSexoInconsistencias.reduce<Record<string, DashboardFiliacaoSituacaoSexoInconsistenciaItem[]>>(
      (acc, item) => {
        const key = String(item.situacaoCodigo ?? '').trim();
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {}
    );
  }, [filiacaoSituacaoSexoInconsistencias]);

  const filiacaoSituacaoRegiaoPorCodigo = useMemo(() => {
    return filiacaoSituacaoRegiaoDistribuicao.reduce<
      Record<string, DashboardFiliacaoSituacaoRegiaoDistribuicaoItem[]>
    >((acc, item) => {
      const key = String(item.situacaoCodigo ?? '').trim();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [filiacaoSituacaoRegiaoDistribuicao]);

  const filiacaoSituacaoRegiaoInconsistenciasPorCodigo = useMemo(() => {
    return filiacaoSituacaoRegiaoInconsistencias.reduce<
      Record<string, DashboardFiliacaoSituacaoRegiaoInconsistenciaItem[]>
    >((acc, item) => {
      const key = String(item.situacaoCodigo ?? '').trim();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [filiacaoSituacaoRegiaoInconsistencias]);

  const filiacaoSituacaoDesfiliadosSexoPorCodigo = useMemo(() => {
    return filiacaoSituacaoDesfiliadosSexo.reduce<
      Record<string, DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoItem[]>
    >((acc, item) => {
      const key = String(item.situacaoCodigo ?? '').trim();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [filiacaoSituacaoDesfiliadosSexo]);

  const filiacaoSituacaoDesfiliadosSexoInconsistenciasPorCodigo = useMemo(() => {
    return filiacaoSituacaoDesfiliadosSexoInconsistencias.reduce<
      Record<string, DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciaItem[]>
    >((acc, item) => {
      const key = String(item.situacaoCodigo ?? '').trim();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [filiacaoSituacaoDesfiliadosSexoInconsistencias]);

  const filiacaoSituacaoDesfiliadosRegiaoPorCodigo = useMemo(() => {
    return filiacaoSituacaoDesfiliadosRegiao.reduce<
      Record<string, DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoItem[]>
    >((acc, item) => {
      const key = String(item.situacaoCodigo ?? '').trim();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [filiacaoSituacaoDesfiliadosRegiao]);

  const filiacaoSituacaoDesfiliadosRegiaoInconsistenciasPorCodigo = useMemo(() => {
    return filiacaoSituacaoDesfiliadosRegiaoInconsistencias.reduce<
      Record<string, DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaItem[]>
    >((acc, item) => {
      const key = String(item.situacaoCodigo ?? '').trim();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [filiacaoSituacaoDesfiliadosRegiaoInconsistencias]);

  function toggleDetalheSexoSituacao(codigo: string) {
    setFiliacaoSituacaoSexoAberta((current) => (current === codigo ? '' : codigo));
  }

  function toggleInconsistenciaSexoSituacao(codigo: string) {
    setFiliacaoSituacaoSexoInconsistenciaAberta((current) => (current === codigo ? '' : codigo));
  }

  function toggleDetalheRegiaoSituacao(codigo: string) {
    setFiliacaoSituacaoRegiaoAberta((current) => (current === codigo ? '' : codigo));
  }

  function toggleInconsistenciaRegiaoSituacao(codigo: string) {
    setFiliacaoSituacaoRegiaoInconsistenciaAberta((current) => (current === codigo ? '' : codigo));
  }

  async function openRegiaoEsferaModal(
    situacaoCodigo: string,
    situacaoDescricao: string,
    regiaoCodigo: string,
    regiaoDescricao: string,
    origem: 'ativos' | 'desfiliados' = 'ativos'
  ) {
    setFiliacaoSituacaoRegiaoEsferaModal({
      origem,
      situacaoCodigo,
      situacaoDescricao,
      regiaoCodigo,
      regiaoDescricao
    });
    setFiliacaoSituacaoRegiaoEsferaLoading(true);
    setFiliacaoSituacaoRegiaoEsferaError('');
    setFiliacaoSituacaoRegiaoEsferaDistribuicao([]);
    setFiliacaoSituacaoRegiaoEsferaSexoAberta('');
    setFiliacaoSituacaoRegiaoEsferaSexoError('');
    setFiliacaoSituacaoRegiaoEsferaSexoDistribuicao([]);

    try {
      const endpoint =
        origem === 'desfiliados'
          ? '/dashboard/filiacao-situacao-desfiliados-regiao-esfera-distribuicao'
          : '/dashboard/filiacao-situacao-regiao-esfera-distribuicao';
      const response = await api.get<{ data: DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoResponse }>(
        endpoint,
        {
          params: {
            situacaoCodigo,
            regiaoCodigo
          }
        }
      );
      setFiliacaoSituacaoRegiaoEsferaDistribuicao(response.data.data.items ?? []);
    } catch {
      setFiliacaoSituacaoRegiaoEsferaDistribuicao([]);
      setFiliacaoSituacaoRegiaoEsferaError(
        'Nao foi possivel carregar a distribuicao entre Estado e Municipio para a regiao selecionada.'
      );
    } finally {
      setFiliacaoSituacaoRegiaoEsferaLoading(false);
    }
  }

  function toggleDetalheSexoRegiaoEsfera(esfera: string) {
    const esferaNormalizada = String(esfera ?? '').trim().toUpperCase();

    if (!filiacaoSituacaoRegiaoEsferaModal) {
      return;
    }

    if (filiacaoSituacaoRegiaoEsferaSexoAberta === esferaNormalizada) {
      setFiliacaoSituacaoRegiaoEsferaSexoAberta('');
      setFiliacaoSituacaoRegiaoEsferaSexoError('');
      setFiliacaoSituacaoRegiaoEsferaSexoDistribuicao([]);
      return;
    }

    setFiliacaoSituacaoRegiaoEsferaSexoAberta(esferaNormalizada);
    setFiliacaoSituacaoRegiaoEsferaSexoLoading(true);
    setFiliacaoSituacaoRegiaoEsferaSexoError('');
    setFiliacaoSituacaoRegiaoEsferaSexoDistribuicao([]);

    const endpoint =
      filiacaoSituacaoRegiaoEsferaModal.origem === 'desfiliados'
        ? '/dashboard/filiacao-situacao-desfiliados-regiao-esfera-sexo-distribuicao'
        : '/dashboard/filiacao-situacao-regiao-esfera-sexo-distribuicao';

    void api
      .get<{ data: DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoResponse }>(endpoint, {
        params: {
          situacaoCodigo: filiacaoSituacaoRegiaoEsferaModal.situacaoCodigo,
          regiaoCodigo: filiacaoSituacaoRegiaoEsferaModal.regiaoCodigo,
          esfera: esferaNormalizada
        }
      })
      .then((response) => {
        setFiliacaoSituacaoRegiaoEsferaSexoDistribuicao(response.data.data.items ?? []);
      })
      .catch(() => {
        setFiliacaoSituacaoRegiaoEsferaSexoDistribuicao([]);
        setFiliacaoSituacaoRegiaoEsferaSexoError(
          'Nao foi possivel carregar a distribuicao por sexo para a esfera selecionada.'
        );
      })
      .finally(() => {
        setFiliacaoSituacaoRegiaoEsferaSexoLoading(false);
      });
  }

  function toggleDetalheSexoSituacaoDesfiliados(codigo: string) {
    setFiliacaoSituacaoDesfiliadosSexoAberta((current) => (current === codigo ? '' : codigo));
  }

  function toggleInconsistenciaSexoSituacaoDesfiliados(codigo: string) {
    setFiliacaoSituacaoDesfiliadosSexoInconsistenciaAberta((current) => (current === codigo ? '' : codigo));
  }

  function toggleDetalheRegiaoSituacaoDesfiliados(codigo: string) {
    setFiliacaoSituacaoDesfiliadosRegiaoAberta((current) => (current === codigo ? '' : codigo));
  }

  function toggleInconsistenciaRegiaoSituacaoDesfiliados(codigo: string) {
    setFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaAberta((current) => (current === codigo ? '' : codigo));
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
              {card.description ? (
                loading ? (
                  <MetricDescriptionSkeleton />
                ) : (
                  <p className="mt-1 text-xs text-slate-500">{card.description}</p>
                )
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
                      <TableRowsSkeleton columns={5} rows={4} />
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
              {card.description ? (
                loading ? (
                  <MetricDescriptionSkeleton />
                ) : (
                  <p className="mt-1 text-xs text-slate-500">{card.description}</p>
                )
              ) : null}
            </button>
          ))}
        </div>

        <article className="metric-card mt-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Situação Funcional da Filiação</h3>
              <p className="text-xs text-slate-500">
                Quantidade e percentual por situação da filiação, considerando apenas ASSOCIADOS ativos no cadastro.
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
                      <TableRowsSkeleton columns={3} rows={4} />
                    ) : filiacaoSituacaoDistribuicao.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                          Nenhuma situação funcional encontrada para exibição.
                        </td>
                      </tr>
                    ) : (
                      filiacaoSituacaoDistribuicao.map((item) => {
                        const situacaoCodigo = String(item.codigo ?? '').trim();
                        const situacaoStyle = getFiliacaoSituacaoColorStyle(item);
                        const situacaoSexoEstaAberta = filiacaoSituacaoSexoAberta === situacaoCodigo;
                        const situacaoRegiaoEstaAberta = filiacaoSituacaoRegiaoAberta === situacaoCodigo;
                        const sexoDaSituacao = filiacaoSituacaoSexoPorCodigo[situacaoCodigo] ?? [];
                        const inconsistenciasSexoDaSituacao =
                          filiacaoSituacaoSexoInconsistenciasPorCodigo[situacaoCodigo] ?? [];
                        const regiaoDaSituacao = filiacaoSituacaoRegiaoPorCodigo[situacaoCodigo] ?? [];
                        const inconsistenciasDaSituacao =
                          filiacaoSituacaoRegiaoInconsistenciasPorCodigo[situacaoCodigo] ?? [];
                        const situacaoInconsistenciaEstaAberta =
                          filiacaoSituacaoRegiaoInconsistenciaAberta === situacaoCodigo;
                        const situacaoSexoInconsistenciaEstaAberta =
                          filiacaoSituacaoSexoInconsistenciaAberta === situacaoCodigo;
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
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                                    aria-expanded={situacaoRegiaoEstaAberta}
                                    aria-label={`Ver distribuição por região da situação ${item.descricao || item.codigo}`}
                                    onClick={() => toggleDetalheRegiaoSituacao(situacaoCodigo)}
                                  >
                                    {situacaoRegiaoEstaAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    {situacaoRegiaoEstaAberta ? 'Ocultar' : 'Ver região'}
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                                    aria-expanded={situacaoSexoEstaAberta}
                                    aria-label={`Ver distribuição por sexo da situação ${item.descricao || item.codigo}`}
                                    onClick={() => toggleDetalheSexoSituacao(situacaoCodigo)}
                                  >
                                    {situacaoSexoEstaAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    {situacaoSexoEstaAberta ? 'Ocultar' : 'Ver sexo'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {situacaoSexoEstaAberta || situacaoRegiaoEstaAberta ? (
                              <tr>
                                <td colSpan={3} className="bg-slate-50/50 px-4 py-3">
                                  <div className="space-y-3">
                                    {situacaoRegiaoEstaAberta ? (
                                      <div>
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Distribuição por Região
                                          </p>
                                          {inconsistenciasDaSituacao.length > 0 ? (
                                            <button
                                              type="button"
                                              className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                                              aria-expanded={situacaoInconsistenciaEstaAberta}
                                              onClick={() => toggleInconsistenciaRegiaoSituacao(situacaoCodigo)}
                                            >
                                              {situacaoInconsistenciaEstaAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                              {situacaoInconsistenciaEstaAberta
                                                ? 'Ocultar inconsistências'
                                                : `Inconsistências (${inconsistenciasDaSituacao.length})`}
                                            </button>
                                          ) : null}
                                        </div>
                                        {filiacaoSituacaoRegiaoDistribuicaoError ? (
                                          <div className="alert-error">{filiacaoSituacaoRegiaoDistribuicaoError}</div>
                                        ) : filiacaoSituacaoRegiaoDistribuicaoLoading ? (
                                          <PanelSkeleton rows={3} />
                                        ) : regiaoDaSituacao.length === 0 ? (
                                          <p className="text-sm text-slate-500">
                                            Nenhum dado de distribuição por região encontrado para esta situação.
                                          </p>
                                        ) : (
                                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                            {regiaoDaSituacao.map((regiaoItem) => (
                                              <button
                                                key={`${regiaoItem.situacaoCodigo}-${regiaoItem.regiaoCodigo}`}
                                                type="button"
                                                className="rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                onClick={() =>
                                                  openRegiaoEsferaModal(
                                                    situacaoCodigo,
                                                    item.descricao || item.codigo || 'Nao informado',
                                                    regiaoItem.regiaoCodigo,
                                                    regiaoItem.regiaoDescricao || regiaoItem.regiaoCodigo || 'Nao informado'
                                                  )
                                                }
                                                aria-label={`Ver distribuicao Estado e Municipio da regiao ${
                                                  regiaoItem.regiaoDescricao || regiaoItem.regiaoCodigo || 'Nao informado'
                                                }`}
                                              >
                                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                  {regiaoItem.regiaoDescricao || regiaoItem.regiaoCodigo || 'Não informado'}
                                                </span>
                                                <p className="mt-2 text-sm font-medium text-slate-700">
                                                  <AnimatedInlineCount
                                                    value={regiaoItem.totalQtd}
                                                    loading={filiacaoSituacaoRegiaoDistribuicaoLoading}
                                                  />{' '}
                                                  (
                                                  <AnimatedInlinePercent
                                                    value={regiaoItem.totalPercentual}
                                                    loading={filiacaoSituacaoRegiaoDistribuicaoLoading}
                                                  />
                                                  )
                                                </p>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                        {situacaoInconsistenciaEstaAberta ? (
                                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                              Filiações sem região válida para mapeamento
                                            </p>
                                            {filiacaoSituacaoRegiaoInconsistenciasError ? (
                                              <div className="alert-error">{filiacaoSituacaoRegiaoInconsistenciasError}</div>
                                            ) : filiacaoSituacaoRegiaoInconsistenciasLoading ? (
                                              <PanelSkeleton rows={3} />
                                            ) : (
                                              <div className="max-h-64 overflow-auto rounded-lg border border-amber-200 bg-white">
                                                <table className="min-w-full divide-y divide-amber-100">
                                                  <thead className="bg-amber-50">
                                                    <tr>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        CPF
                                                      </th>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        Nome
                                                      </th>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        Motivo
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-amber-100">
                                                    {inconsistenciasDaSituacao.map((inc, idx) => (
                                                      <tr key={`${inc.situacaoCodigo}-${inc.cpf}-${idx}`} className="hover:bg-amber-50/60">
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.cpf || '-'}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.nome || 'Sem nome'}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.motivo || 'Não informado'}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}

                                    {situacaoSexoEstaAberta ? (
                                      <div>
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Distribuição por Sexo
                                          </p>
                                          {inconsistenciasSexoDaSituacao.length > 0 ? (
                                            <button
                                              type="button"
                                              className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                                              aria-expanded={situacaoSexoInconsistenciaEstaAberta}
                                              onClick={() => toggleInconsistenciaSexoSituacao(situacaoCodigo)}
                                            >
                                              {situacaoSexoInconsistenciaEstaAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                              {situacaoSexoInconsistenciaEstaAberta
                                                ? 'Ocultar inconsistências'
                                                : `Inconsistências (${inconsistenciasSexoDaSituacao.length})`}
                                            </button>
                                          ) : null}
                                        </div>
                                        {filiacaoSituacaoSexoDistribuicaoError ? (
                                          <div className="alert-error">{filiacaoSituacaoSexoDistribuicaoError}</div>
                                        ) : filiacaoSituacaoSexoDistribuicaoLoading ? (
                                          <PanelSkeleton rows={3} />
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
                                        {situacaoSexoInconsistenciaEstaAberta ? (
                                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                              Filiações com inconsistências de sexo
                                            </p>
                                            {filiacaoSituacaoSexoInconsistenciasError ? (
                                              <div className="alert-error">{filiacaoSituacaoSexoInconsistenciasError}</div>
                                            ) : filiacaoSituacaoSexoInconsistenciasLoading ? (
                                              <PanelSkeleton rows={3} />
                                            ) : (
                                              <div className="max-h-64 overflow-auto rounded-lg border border-amber-200 bg-white">
                                                <table className="min-w-full divide-y divide-amber-100">
                                                  <thead className="bg-amber-50">
                                                    <tr>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        CPF
                                                      </th>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        Nome
                                                      </th>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        Motivo
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-amber-100">
                                                    {inconsistenciasSexoDaSituacao.map((inc, idx) => (
                                                      <tr
                                                        key={`${inc.situacaoCodigo}-${inc.cpf}-${idx}`}
                                                        className="hover:bg-amber-50/60"
                                                      >
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.cpf || '-'}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.nome || 'Sem nome'}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.motivo || 'Não informado'}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>
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
                      <TableRowsSkeleton columns={3} rows={4} />
                    ) : filiacaoSituacaoDesfiliados.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                          Nenhuma situação de desfiliados encontrada para exibição.
                        </td>
                      </tr>
                    ) : (
                      filiacaoSituacaoDesfiliados.map((item) => {
                        const situacaoCodigo = String(item.codigo ?? '').trim();
                        const situacaoStyle = getFiliacaoSituacaoColorStyle({
                          codigo: item.codigo,
                          descricao: item.descricao,
                          totalFiliacoesQtd: 0,
                          totalFiliacoesPercentual: 0
                        });
                        const situacaoSexoEstaAberta = filiacaoSituacaoDesfiliadosSexoAberta === situacaoCodigo;
                        const situacaoRegiaoEstaAberta = filiacaoSituacaoDesfiliadosRegiaoAberta === situacaoCodigo;
                        const situacaoInconsistenciaEstaAberta =
                          filiacaoSituacaoDesfiliadosRegiaoInconsistenciaAberta === situacaoCodigo;
                        const sexoDaSituacao = filiacaoSituacaoDesfiliadosSexoPorCodigo[situacaoCodigo] ?? [];
                        const inconsistenciasSexoDaSituacao =
                          filiacaoSituacaoDesfiliadosSexoInconsistenciasPorCodigo[situacaoCodigo] ?? [];
                        const regiaoDaSituacao = filiacaoSituacaoDesfiliadosRegiaoPorCodigo[situacaoCodigo] ?? [];
                        const inconsistenciasDaSituacao =
                          filiacaoSituacaoDesfiliadosRegiaoInconsistenciasPorCodigo[situacaoCodigo] ?? [];
                        const situacaoSexoInconsistenciaEstaAberta =
                          filiacaoSituacaoDesfiliadosSexoInconsistenciaAberta === situacaoCodigo;

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
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                                    aria-expanded={situacaoRegiaoEstaAberta}
                                    aria-label={`Ver distribuição por região da situação ${item.descricao || item.codigo}`}
                                    onClick={() => toggleDetalheRegiaoSituacaoDesfiliados(situacaoCodigo)}
                                  >
                                    {situacaoRegiaoEstaAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    {situacaoRegiaoEstaAberta ? 'Ocultar' : 'Ver região'}
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                                    aria-expanded={situacaoSexoEstaAberta}
                                    aria-label={`Ver distribuição por sexo da situação ${item.descricao || item.codigo}`}
                                    onClick={() => toggleDetalheSexoSituacaoDesfiliados(situacaoCodigo)}
                                  >
                                    {situacaoSexoEstaAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    {situacaoSexoEstaAberta ? 'Ocultar' : 'Ver sexo'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {situacaoSexoEstaAberta || situacaoRegiaoEstaAberta ? (
                              <tr>
                                <td colSpan={3} className="bg-slate-50/50 px-4 py-3">
                                  <div className="space-y-3">
                                    {situacaoRegiaoEstaAberta ? (
                                      <div>
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Distribuição por Região
                                          </p>
                                          {inconsistenciasDaSituacao.length > 0 ? (
                                            <button
                                              type="button"
                                              className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                                              aria-expanded={situacaoInconsistenciaEstaAberta}
                                              onClick={() => toggleInconsistenciaRegiaoSituacaoDesfiliados(situacaoCodigo)}
                                            >
                                              {situacaoInconsistenciaEstaAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                              {situacaoInconsistenciaEstaAberta
                                                ? 'Ocultar inconsistências'
                                                : `Inconsistências (${inconsistenciasDaSituacao.length})`}
                                            </button>
                                          ) : null}
                                        </div>
                                        {filiacaoSituacaoDesfiliadosRegiaoError ? (
                                          <div className="alert-error">{filiacaoSituacaoDesfiliadosRegiaoError}</div>
                                        ) : filiacaoSituacaoDesfiliadosRegiaoLoading ? (
                                          <PanelSkeleton rows={3} />
                                        ) : regiaoDaSituacao.length === 0 ? (
                                          <p className="text-sm text-slate-500">
                                            Nenhum dado de distribuição por região encontrado para esta situação.
                                          </p>
                                        ) : (
                                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                            {regiaoDaSituacao.map((regiaoItem) => (
                                              <button
                                                key={`${regiaoItem.situacaoCodigo}-${regiaoItem.regiaoCodigo}`}
                                                type="button"
                                                className="rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                onClick={() =>
                                                  openRegiaoEsferaModal(
                                                    situacaoCodigo,
                                                    item.descricao || item.codigo || 'Nao informado',
                                                    regiaoItem.regiaoCodigo,
                                                    regiaoItem.regiaoDescricao || regiaoItem.regiaoCodigo || 'Nao informado',
                                                    'desfiliados'
                                                  )
                                                }
                                                aria-label={`Ver distribuicao Estado e Municipio da regiao ${
                                                  regiaoItem.regiaoDescricao || regiaoItem.regiaoCodigo || 'Nao informado'
                                                }`}
                                              >
                                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                  {regiaoItem.regiaoDescricao || regiaoItem.regiaoCodigo || 'Não informado'}
                                                </span>
                                                <p className="mt-2 text-sm font-medium text-slate-700">
                                                  <AnimatedInlineCount
                                                    value={regiaoItem.totalQtd}
                                                    loading={filiacaoSituacaoDesfiliadosRegiaoLoading}
                                                  />{' '}
                                                  (
                                                  <AnimatedInlinePercent
                                                    value={regiaoItem.totalPercentual}
                                                    loading={filiacaoSituacaoDesfiliadosRegiaoLoading}
                                                  />
                                                  )
                                                </p>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                        {situacaoInconsistenciaEstaAberta ? (
                                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                              Filiações sem região válida para mapeamento
                                            </p>
                                            {filiacaoSituacaoDesfiliadosRegiaoInconsistenciasError ? (
                                              <div className="alert-error">{filiacaoSituacaoDesfiliadosRegiaoInconsistenciasError}</div>
                                            ) : filiacaoSituacaoDesfiliadosRegiaoInconsistenciasLoading ? (
                                              <PanelSkeleton rows={3} />
                                            ) : (
                                              <div className="max-h-64 overflow-auto rounded-lg border border-amber-200 bg-white">
                                                <table className="min-w-full divide-y divide-amber-100">
                                                  <thead className="bg-amber-50">
                                                    <tr>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        CPF
                                                      </th>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        Nome
                                                      </th>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        Motivo
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-amber-100">
                                                    {inconsistenciasDaSituacao.map((inc, idx) => (
                                                      <tr key={`${inc.situacaoCodigo}-${inc.cpf}-${idx}`} className="hover:bg-amber-50/60">
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.cpf || '-'}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.nome || 'Sem nome'}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.motivo || 'Não informado'}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}

                                    {situacaoSexoEstaAberta ? (
                                      <div>
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Distribuição por Sexo
                                          </p>
                                          {inconsistenciasSexoDaSituacao.length > 0 ? (
                                            <button
                                              type="button"
                                              className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                                              aria-expanded={situacaoSexoInconsistenciaEstaAberta}
                                              onClick={() => toggleInconsistenciaSexoSituacaoDesfiliados(situacaoCodigo)}
                                            >
                                              {situacaoSexoInconsistenciaEstaAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                              {situacaoSexoInconsistenciaEstaAberta
                                                ? 'Ocultar inconsistências'
                                                : `Inconsistências (${inconsistenciasSexoDaSituacao.length})`}
                                            </button>
                                          ) : null}
                                        </div>
                                        {filiacaoSituacaoDesfiliadosSexoError ? (
                                          <div className="alert-error">{filiacaoSituacaoDesfiliadosSexoError}</div>
                                        ) : filiacaoSituacaoDesfiliadosSexoLoading ? (
                                          <PanelSkeleton rows={3} />
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
                                        {situacaoSexoInconsistenciaEstaAberta ? (
                                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                              Filiações com inconsistências de sexo
                                            </p>
                                            {filiacaoSituacaoDesfiliadosSexoInconsistenciasError ? (
                                              <div className="alert-error">{filiacaoSituacaoDesfiliadosSexoInconsistenciasError}</div>
                                            ) : filiacaoSituacaoDesfiliadosSexoInconsistenciasLoading ? (
                                              <PanelSkeleton rows={3} />
                                            ) : (
                                              <div className="max-h-64 overflow-auto rounded-lg border border-amber-200 bg-white">
                                                <table className="min-w-full divide-y divide-amber-100">
                                                  <thead className="bg-amber-50">
                                                    <tr>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        CPF
                                                      </th>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        Nome
                                                      </th>
                                                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        Motivo
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-amber-100">
                                                    {inconsistenciasSexoDaSituacao.map((inc, idx) => (
                                                      <tr
                                                        key={`${inc.situacaoCodigo}-${inc.cpf}-${idx}`}
                                                        className="hover:bg-amber-50/60"
                                                      >
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.cpf || '-'}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.nome || 'Sem nome'}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-700">{inc.motivo || 'Não informado'}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>
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

      <ConsignacoesSection />

      {filiacaoSituacaoRegiaoEsferaModal ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4"
          onClick={() => setFiliacaoSituacaoRegiaoEsferaModal(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Distribuicao Estado x Municipio</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Situacao: {filiacaoSituacaoRegiaoEsferaModal.situacaoDescricao} | Regiao:{' '}
                  {filiacaoSituacaoRegiaoEsferaModal.regiaoDescricao}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setFiliacaoSituacaoRegiaoEsferaModal(null)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {filiacaoSituacaoRegiaoEsferaError ? (
              <div className="alert-error mt-4">{filiacaoSituacaoRegiaoEsferaError}</div>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-[280px_1fr] md:items-center">
              <AnimatedPieChart
                loading={filiacaoSituacaoRegiaoEsferaLoading}
                slices={[
                  {
                    label: 'Estado',
                    value:
                      filiacaoSituacaoRegiaoEsferaDistribuicao.find((item) => item.esfera.toUpperCase() === 'ESTADO')
                        ?.totalQtd ?? 0,
                    color: '#0284c7'
                  },
                  {
                    label: 'Municipio',
                    value:
                      filiacaoSituacaoRegiaoEsferaDistribuicao.find(
                        (item) => item.esfera.toUpperCase() === 'MUNICIPIO'
                      )?.totalQtd ?? 0,
                    color: '#16a34a'
                  }
                ]}
              />

              <div className="space-y-3">
                {filiacaoSituacaoRegiaoEsferaLoading ? (
                  <PanelSkeleton rows={4} />
                ) : (
                  <>
                    {filiacaoSituacaoRegiaoEsferaDistribuicao.map((item) => {
                      const isEstado = item.esfera.toUpperCase() === 'ESTADO';
                      const esferaNormalizada = item.esfera.toUpperCase();
                      const sexoAbertoNaEsfera = filiacaoSituacaoRegiaoEsferaSexoAberta === esferaNormalizada;
                      return (
                        <div
                          key={item.esfera}
                          className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-700"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 font-semibold">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: isEstado ? '#0284c7' : '#16a34a' }}
                              />
                              {isEstado ? 'Estado' : 'Municipio'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span>{item.totalQtd.toLocaleString('pt-BR')}</span>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                                aria-expanded={sexoAbertoNaEsfera}
                                onClick={() => toggleDetalheSexoRegiaoEsfera(item.esfera)}
                              >
                                {sexoAbertoNaEsfera ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                {sexoAbertoNaEsfera ? 'Ocultar' : 'Ver sexo'}
                              </button>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{item.totalPercentual.toFixed(2).replace('.', ',')}%</p>
                          {sexoAbertoNaEsfera ? (
                            <div className="mt-3 rounded-md border border-slate-200 bg-white p-2.5">
                              {filiacaoSituacaoRegiaoEsferaSexoError ? (
                                <p className="text-xs text-rose-700">{filiacaoSituacaoRegiaoEsferaSexoError}</p>
                              ) : filiacaoSituacaoRegiaoEsferaSexoLoading ? (
                                <PanelSkeleton rows={2} />
                              ) : filiacaoSituacaoRegiaoEsferaSexoDistribuicao.length === 0 ? (
                                <p className="text-xs text-slate-500">Nenhum dado de sexo encontrado para esta esfera.</p>
                              ) : (
                                <div className="space-y-2">
                                  {filiacaoSituacaoRegiaoEsferaSexoDistribuicao.map((sexoItem) => (
                                    <div key={`${sexoItem.esfera}-${sexoItem.genero}`} className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-medium text-slate-700">{sexoItem.generoDescricao || sexoItem.genero}</span>
                                      <span className="text-xs text-slate-600">
                                        {sexoItem.totalQtd.toLocaleString('pt-BR')} ({sexoItem.totalPercentual.toFixed(2).replace('.', ',')}%)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
