import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  getConsignacoesInconsistencias,
  getConsignacoesPorEntePublico,
  getConsignacoesPorPeriodo,
  getConsignacoesPorRegiao,
  getConsignacoesPorSituacao,
  getConsignacoesResumo,
  type ConsignacaoFilters,
  type ConsignacaoInconsistenciasResponse,
  type ConsignacaoPorEntePublicoItem,
  type ConsignacaoPorPeriodoItem,
  type ConsignacaoPorRegiaoItem,
  type ConsignacaoPorSituacaoItem,
  type ConsignacaoResumo
} from '../services/dashboardConsignacoesService';

const initialResumo: ConsignacaoResumo = {
  totalContribuido: 0,
  totalAnoAtual: 0,
  totalMesAtual: 0,
  mediaMensal: 0,
  quantidadeRegistros: 0,
  quantidadeContribuintes: 0,
  periodo: {
    anoInicial: null,
    anoFinal: null,
    ultimoAnoDisponivel: null,
    ultimoMesDisponivel: null,
    anoReferencia: null,
    mesReferencia: null
  }
};

interface DraftFiltersState {
  ano: string;
  mes: string;
  regiao: string;
  situacao: string;
  codigoEmpresa: string;
  periodoInicio: string;
  periodoFim: string;
}

const initialDraftFilters: DraftFiltersState = {
  ano: '',
  mes: '',
  regiao: '',
  situacao: '',
  codigoEmpresa: '',
  periodoInicio: '',
  periodoFim: ''
};

function toMonthLabel(value: number) {
  const date = new Date(2000, Math.max(0, Math.min(11, value - 1)), 1);
  return date.toLocaleDateString('pt-BR', { month: 'long' });
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatInt(value: number) {
  return value.toLocaleString('pt-BR');
}

function formatPercent(value: number) {
  return `${value.toFixed(2).replace('.', ',')}%`;
}

function parseDraftFilters(draft: DraftFiltersState): ConsignacaoFilters {
  return {
    ano: draft.ano ? Number.parseInt(draft.ano, 10) : undefined,
    mes: draft.mes ? Number.parseInt(draft.mes, 10) : undefined,
    regiao: draft.regiao || undefined,
    situacao: draft.situacao || undefined,
    codigoEmpresa: draft.codigoEmpresa || undefined,
    periodoInicio: draft.periodoInicio || undefined,
    periodoFim: draft.periodoFim || undefined
  };
}

export function ConsignacoesSection() {
  const [draftFilters, setDraftFilters] = useState<DraftFiltersState>(initialDraftFilters);
  const [filters, setFilters] = useState<ConsignacaoFilters>({});
  const [resumo, setResumo] = useState<ConsignacaoResumo>(initialResumo);
  const [porRegiao, setPorRegiao] = useState<ConsignacaoPorRegiaoItem[]>([]);
  const [porPeriodo, setPorPeriodo] = useState<ConsignacaoPorPeriodoItem[]>([]);
  const [porSituacao, setPorSituacao] = useState<ConsignacaoPorSituacaoItem[]>([]);
  const [porEntePublico, setPorEntePublico] = useState<ConsignacaoPorEntePublicoItem[]>([]);
  const [inconsistencias, setInconsistencias] = useState<ConsignacaoInconsistenciasResponse>({
    totalInconsistencias: 0,
    items: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [regiaoExpandida, setRegiaoExpandida] = useState(false);
  const [periodoExpandido, setPeriodoExpandido] = useState(false);
  const [situacaoExpandida, setSituacaoExpandida] = useState(false);
  const [enteExpandido, setEnteExpandido] = useState(false);
  const [inconsistenciasExpandida, setInconsistenciasExpandida] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [resumoData, regiaoData, periodoData, situacaoData, enteData, inconsistenciasData] = await Promise.all([
          getConsignacoesResumo(filters),
          getConsignacoesPorRegiao(filters),
          getConsignacoesPorPeriodo(filters),
          getConsignacoesPorSituacao(filters),
          getConsignacoesPorEntePublico(filters),
          getConsignacoesInconsistencias(filters)
        ]);

        setResumo(resumoData);
        setPorRegiao(regiaoData);
        setPorPeriodo(periodoData);
        setPorSituacao(situacaoData);
        setPorEntePublico(enteData);
        setInconsistencias(inconsistenciasData);
      } catch (loadError) {
        console.error(loadError);
        setError('Não foi possível carregar os indicadores de consignação.');
        setResumo(initialResumo);
        setPorRegiao([]);
        setPorPeriodo([]);
        setPorSituacao([]);
        setPorEntePublico([]);
        setInconsistencias({ totalInconsistencias: 0, items: [] });
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [filters]);

  const anosDisponiveis = useMemo(() => {
    const years = Array.from(new Set(porPeriodo.map((item) => item.ano)));
    return years.sort((a, b) => b - a);
  }, [porPeriodo]);

  const regioesDisponiveis = useMemo(
    () =>
      porRegiao
        .map((item) => ({ codigo: item.regiaoCodigo, descricao: item.regiaoDescricao }))
        .filter((item) => item.codigo && item.codigo !== '__SEM_REGIAO__'),
    [porRegiao]
  );

  const situacoesDisponiveis = useMemo(
    () =>
      porSituacao
        .map((item) => ({ codigo: item.situacaoCodigo, descricao: item.situacaoDescricao }))
        .filter((item) => item.codigo && item.codigo !== '__SEM_SITUACAO__'),
    [porSituacao]
  );

  const entesDisponiveis = useMemo(
    () =>
      porEntePublico
        .map((item) => ({ codigo: item.codigoEmpresa, descricao: item.enteDescricao }))
        .filter((item) => item.codigo && item.codigo !== '__SEM_EMPRESA__'),
    [porEntePublico]
  );

  const semDados = !loading && !error && resumo.quantidadeRegistros === 0;

  function applyFilters() {
    setFilters(parseDraftFilters(draftFilters));
  }

  function clearFilters() {
    setDraftFilters(initialDraftFilters);
    setFilters({});
  }

  return (
    <section className="ds-card">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900">Visão por Contribuição Sindical</h2>
        <p className="text-sm text-slate-600">
          Indicadores de consignações por período, região, situação, ente público e críticas de repasse.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="form-label text-xs">Ano</label>
            <select
              className="form-input h-10 py-2"
              value={draftFilters.ano}
              onChange={(event) => setDraftFilters((current) => ({ ...current, ano: event.target.value }))}
            >
              <option value="">Todos</option>
              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label text-xs">Mês</label>
            <select
              className="form-input h-10 py-2"
              value={draftFilters.mes}
              onChange={(event) => setDraftFilters((current) => ({ ...current, mes: event.target.value }))}
            >
              <option value="">Todos</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((mes) => (
                <option key={mes} value={mes}>
                  {mes.toString().padStart(2, '0')} - {toMonthLabel(mes)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label text-xs">Região</label>
            <select
              className="form-input h-10 py-2"
              value={draftFilters.regiao}
              onChange={(event) => setDraftFilters((current) => ({ ...current, regiao: event.target.value }))}
            >
              <option value="">Todas</option>
              {regioesDisponiveis.map((regiao) => (
                <option key={`${regiao.codigo}-${regiao.descricao}`} value={regiao.codigo}>
                  {regiao.descricao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label text-xs">Situação</label>
            <select
              className="form-input h-10 py-2"
              value={draftFilters.situacao}
              onChange={(event) => setDraftFilters((current) => ({ ...current, situacao: event.target.value }))}
            >
              <option value="">Todas</option>
              {situacoesDisponiveis.map((situacao) => (
                <option key={`${situacao.codigo}-${situacao.descricao}`} value={situacao.codigo}>
                  {situacao.descricao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label text-xs">Ente público</label>
            <select
              className="form-input h-10 py-2"
              value={draftFilters.codigoEmpresa}
              onChange={(event) => setDraftFilters((current) => ({ ...current, codigoEmpresa: event.target.value }))}
            >
              <option value="">Todos</option>
              {entesDisponiveis.map((ente) => (
                <option key={`${ente.codigo}-${ente.descricao}`} value={ente.codigo}>
                  {ente.descricao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label text-xs">Período inicial</label>
            <input
              type="month"
              className="form-input h-10 py-2"
              value={draftFilters.periodoInicio}
              onChange={(event) => setDraftFilters((current) => ({ ...current, periodoInicio: event.target.value }))}
            />
          </div>

          <div>
            <label className="form-label text-xs">Período final</label>
            <input
              type="month"
              className="form-input h-10 py-2"
              value={draftFilters.periodoFim}
              onChange={(event) => setDraftFilters((current) => ({ ...current, periodoFim: event.target.value }))}
            />
          </div>

          <div className="flex items-end gap-2">
            <button type="button" className="btn-primary h-10 px-4 py-2 text-sm" onClick={applyFilters}>
              Aplicar filtros
            </button>
            <button type="button" className="btn-secondary h-10 px-4 py-2 text-sm" onClick={clearFilters}>
              Limpar
            </button>
          </div>
        </div>
      </div>

      {error ? <div className="alert-error mt-4">{error}</div> : null}

      {semDados ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          Nenhum dado de consignação encontrado para os filtros selecionados.
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <article className="metric-card">
          <p className="text-sm text-slate-600">Total Contribuído</p>
          <p className="mt-2 text-3xl font-semibold text-sindata-900">
            {loading ? '--' : formatCurrency(resumo.totalContribuido)}
          </p>
        </article>
        <article className="metric-card">
          <p className="text-sm text-slate-600">
            Total Contribuído ({resumo.periodo.anoReferencia ?? '---'})
          </p>
          <p className="mt-2 text-3xl font-semibold text-sindata-900">
            {loading ? '--' : formatCurrency(resumo.totalAnoAtual)}
          </p>
        </article>
        <article className="metric-card">
          <p className="text-sm text-slate-600">
            Total Contribuído (Mês {resumo.periodo.mesReferencia ?? '---'})
          </p>
          <p className="mt-2 text-3xl font-semibold text-sindata-900">
            {loading ? '--' : formatCurrency(resumo.totalMesAtual)}
          </p>
        </article>
        <article className="metric-card">
          <p className="text-sm text-slate-600">Média Mensal de Contribuição</p>
          <p className="mt-2 text-3xl font-semibold text-sindata-900">
            {loading ? '--' : formatCurrency(resumo.mediaMensal)}
          </p>
        </article>
        <article className="metric-card">
          <p className="text-sm text-slate-600">Quantidade de Registros</p>
          <p className="mt-2 text-3xl font-semibold text-sindata-900">
            {loading ? '--' : formatInt(resumo.quantidadeRegistros)}
          </p>
        </article>
        <article className="metric-card">
          <p className="text-sm text-slate-600">Quantidade de Contribuintes</p>
          <p className="mt-2 text-3xl font-semibold text-sindata-900">
            {loading ? '--' : formatInt(resumo.quantidadeContribuintes)}
          </p>
        </article>
      </div>

      <div className="mt-4 space-y-3">
        <article className="rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-800"
            onClick={() => setRegiaoExpandida((current) => !current)}
          >
            Distribuição de Contribuição por Região
            {regiaoExpandida ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {regiaoExpandida ? (
            <div className="border-t border-slate-100 p-3">
              {loading ? (
                <p className="text-sm text-slate-500">Carregando distribuição por região...</p>
              ) : porRegiao.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum dado disponível.</p>
              ) : (
                <div className="max-h-80 overflow-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Região
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Valor total
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          %
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Registros
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Contribuintes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {porRegiao.map((item) => (
                        <tr key={`${item.regiaoCodigo}-${item.regiaoDescricao}`}>
                          <td className="px-3 py-2 text-sm text-slate-700">{item.regiaoDescricao}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatCurrency(item.valorTotal)}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatPercent(item.percentual)}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatInt(item.quantidadeRegistros)}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatInt(item.quantidadeContribuintes)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-800"
            onClick={() => setPeriodoExpandido((current) => !current)}
          >
            Distribuição de Contribuição por Ano/Mês
            {periodoExpandido ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {periodoExpandido ? (
            <div className="border-t border-slate-100 p-3">
              {loading ? (
                <p className="text-sm text-slate-500">Carregando distribuição por período...</p>
              ) : porPeriodo.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum dado disponível.</p>
              ) : (
                <div className="max-h-80 overflow-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Período
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Valor total
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          % no ano
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Registros
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {porPeriodo.map((item) => (
                        <tr key={`${item.ano}-${item.mes}`}>
                          <td className="px-3 py-2 text-sm text-slate-700">
                            {item.mes.toString().padStart(2, '0')}/{item.ano}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatCurrency(item.valorTotal)}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatPercent(item.percentualAno)}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatInt(item.quantidadeRegistros)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-800"
            onClick={() => setSituacaoExpandida((current) => !current)}
          >
            Distribuição por Situação
            {situacaoExpandida ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {situacaoExpandida ? (
            <div className="border-t border-slate-100 p-3">
              {loading ? (
                <p className="text-sm text-slate-500">Carregando distribuição por situação...</p>
              ) : porSituacao.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum dado disponível.</p>
              ) : (
                <div className="max-h-80 overflow-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Situação
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Valor total
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          %
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Registros
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {porSituacao.map((item) => (
                        <tr key={`${item.situacaoCodigo}-${item.situacaoDescricao}`}>
                          <td className="px-3 py-2 text-sm text-slate-700">{item.situacaoDescricao}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatCurrency(item.valorTotal)}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatPercent(item.percentual)}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatInt(item.quantidadeRegistros)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-800"
            onClick={() => setEnteExpandido((current) => !current)}
          >
            Distribuição por Ente Público
            {enteExpandido ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {enteExpandido ? (
            <div className="border-t border-slate-100 p-3">
              {loading ? (
                <p className="text-sm text-slate-500">Carregando distribuição por ente público...</p>
              ) : porEntePublico.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum dado disponível.</p>
              ) : (
                <div className="max-h-80 overflow-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Ente público
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Valor total
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          %
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Registros
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {porEntePublico.map((item) => (
                        <tr key={`${item.codigoEmpresa}-${item.enteDescricao}`}>
                          <td className="px-3 py-2 text-sm text-slate-700">{item.enteDescricao}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatCurrency(item.valorTotal)}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatPercent(item.percentual)}</td>
                          <td className="px-3 py-2 text-right text-sm text-slate-700">{formatInt(item.quantidadeRegistros)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </article>

        <article className="rounded-xl border border-amber-200 bg-amber-50/30">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-amber-900"
            onClick={() => setInconsistenciasExpandida((current) => !current)}
          >
            Inconsistências / Críticas de Repasse ({formatInt(inconsistencias.totalInconsistencias)})
            {inconsistenciasExpandida ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {inconsistenciasExpandida ? (
            <div className="border-t border-amber-200 p-3">
              {loading ? (
                <p className="text-sm text-slate-500">Carregando inconsistências...</p>
              ) : inconsistencias.items.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma inconsistência encontrada.</p>
              ) : (
                <div className="max-h-80 overflow-auto rounded-lg border border-amber-200 bg-white">
                  <table className="min-w-full divide-y divide-amber-100">
                    <thead className="bg-amber-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">CPF</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">Nome</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">Ente</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-amber-800">Motivo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {inconsistencias.items.map((item) => (
                        <tr key={item.sequencial} className="hover:bg-amber-50/60">
                          <td className="px-3 py-2 text-sm text-slate-700">{item.cpf || '-'}</td>
                          <td className="px-3 py-2 text-sm text-slate-700">{item.nome || '-'}</td>
                          <td className="px-3 py-2 text-sm text-slate-700">{item.enteDescricao || '-'}</td>
                          <td className="px-3 py-2 text-sm text-slate-700">{item.motivo || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
