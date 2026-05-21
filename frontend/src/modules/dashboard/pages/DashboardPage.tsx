import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';

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

  const cards = useMemo(
    () => [
      { title: 'Total de Pessoas', value: resumo.totalPessoas },
      {
        title: 'Pessoas Filiadas Ativas',
        value: resumo.filiadosAtivos,
        description: `de ${resumo.totalPessoas.toLocaleString('pt-BR')} pessoas no sistema`
      },
      {
        title: 'Pessoas Desfiliadas',
        value: resumo.desfiliados,
        description: `de ${resumo.totalPessoas.toLocaleString('pt-BR')} pessoas no sistema`
      },
      {
        title: 'Pessoas sem nenhum registro de filiação',
        value: resumo.contribuintes,
        description: `de ${resumo.totalPessoas.toLocaleString('pt-BR')} pessoas no sistema`
      }
    ],
    [resumo]
  );

  const filiacaoCards = useMemo(
    () => [
      {
        title: 'Total de Filiações (Ativos/Desfiliados)',
        value: resumo.totalFiliacoes
      },
      {
        title: 'Filiações Ativas',
        value: resumo.totalFiliacoesAtivas,
        description: `de ${resumo.totalFiliacoes.toLocaleString('pt-BR')} filiações no sistema`
      },
      {
        title: 'Filiações Desfiliadas',
        value: resumo.totalFiliacoesDesfiliadas,
        description: `de ${resumo.totalFiliacoes.toLocaleString('pt-BR')} filiações no sistema`
      },
      {
        title: 'Filiações sem Vínculo com Pessoa',
        value: resumo.totalFiliacoesSemVinculoPessoa,
        description: `de ${resumo.totalFiliacoes.toLocaleString('pt-BR')} filiações no sistema`
      }
    ],
    [
      resumo.totalFiliacoes,
      resumo.totalFiliacoesAtivas,
      resumo.totalFiliacoesDesfiliadas,
      resumo.totalFiliacoesSemVinculoPessoa
    ]
  );

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
            <article key={card.title} className="metric-card">
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-semibold text-sindata-900">
                <AnimatedMetricValue value={card.value} loading={loading} />
              </p>
              {'description' in card && !loading ? (
                <p className="mt-1 text-xs text-slate-500">{card.description}</p>
              ) : null}
            </article>
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
            <article key={card.title} className="metric-card">
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-semibold text-sindata-900">
                <AnimatedMetricValue value={card.value} loading={loading} />
              </p>
              {'description' in card && !loading ? (
                <p className="mt-1 text-xs text-slate-500">{card.description}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <article className="ds-card">
        <h2 className="text-lg font-semibold text-slate-900">Próximos passos</h2>
        <p className="mt-2 text-sm text-slate-600">
          Esta base já está pronta para evoluir com filtros avançados, relatórios detalhados e dashboards analíticos.
        </p>
      </article>
    </section>
  );
}
