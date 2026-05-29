import api from '../../../services/api';

export interface ConsignacaoFilters {
  ano?: number;
  mes?: number;
  regiao?: string;
  situacao?: string;
  codigoEmpresa?: string;
  periodoInicio?: string;
  periodoFim?: string;
}

export interface ConsignacaoResumo {
  totalContribuido: number;
  totalAnoAtual: number;
  totalMesAtual: number;
  mediaMensal: number;
  quantidadeRegistros: number;
  quantidadeContribuintes: number;
  periodo: {
    anoInicial: number | null;
    anoFinal: number | null;
    ultimoAnoDisponivel: number | null;
    ultimoMesDisponivel: number | null;
    anoReferencia: number | null;
    mesReferencia: number | null;
  };
}

export interface ConsignacaoPorRegiaoItem {
  regiaoCodigo: string;
  regiaoDescricao: string;
  valorTotal: number;
  percentual: number;
  quantidadeRegistros: number;
  quantidadeContribuintes: number;
}

export interface ConsignacaoPorPeriodoItem {
  ano: number;
  mes: number;
  valorTotal: number;
  percentualAno: number;
  quantidadeRegistros: number;
  quantidadeContribuintes: number;
}

export interface ConsignacaoPorSituacaoItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  valorTotal: number;
  percentual: number;
  quantidadeRegistros: number;
  quantidadeContribuintes: number;
}

export interface ConsignacaoPorEntePublicoItem {
  codigoEmpresa: string;
  enteDescricao: string;
  valorTotal: number;
  percentual: number;
  quantidadeRegistros: number;
  quantidadeContribuintes: number;
}

export interface ConsignacaoInconsistenciaItem {
  sequencial: number;
  codigoEmpresa: string;
  enteDescricao: string;
  codigoPredio: string;
  descricaoPredio: string;
  matricula: string;
  cpf: string;
  nome: string;
  situacaoCodigo: string;
  situacaoDescricao: string;
  regiaoCodigo: string;
  regiaoDescricao: string;
  motivo: string;
}

export interface ConsignacaoInconsistenciasResponse {
  totalInconsistencias: number;
  items: ConsignacaoInconsistenciaItem[];
}

function buildParams(filters: ConsignacaoFilters) {
  const params: Record<string, string | number> = {};

  if (filters.ano !== undefined) {
    params.ano = filters.ano;
  }
  if (filters.mes !== undefined) {
    params.mes = filters.mes;
  }
  if (filters.regiao) {
    params.regiao = filters.regiao;
  }
  if (filters.situacao) {
    params.situacao = filters.situacao;
  }
  if (filters.codigoEmpresa) {
    params.codigoEmpresa = filters.codigoEmpresa;
  }
  if (filters.periodoInicio) {
    params.periodoInicio = filters.periodoInicio;
  }
  if (filters.periodoFim) {
    params.periodoFim = filters.periodoFim;
  }

  return params;
}

export async function getConsignacoesResumo(filters: ConsignacaoFilters) {
  const response = await api.get<{ data: ConsignacaoResumo }>('/dashboard/consignacoes/resumo', {
    params: buildParams(filters)
  });
  return response.data.data;
}

export async function getConsignacoesPorRegiao(filters: ConsignacaoFilters) {
  const response = await api.get<{ data: { items: ConsignacaoPorRegiaoItem[] } }>('/dashboard/consignacoes/por-regiao', {
    params: buildParams(filters)
  });
  return response.data.data.items ?? [];
}

export async function getConsignacoesPorPeriodo(filters: ConsignacaoFilters) {
  const response = await api.get<{ data: { items: ConsignacaoPorPeriodoItem[] } }>('/dashboard/consignacoes/por-periodo', {
    params: buildParams(filters)
  });
  return response.data.data.items ?? [];
}

export async function getConsignacoesPorSituacao(filters: ConsignacaoFilters) {
  const response = await api.get<{ data: { items: ConsignacaoPorSituacaoItem[] } }>('/dashboard/consignacoes/por-situacao', {
    params: buildParams(filters)
  });
  return response.data.data.items ?? [];
}

export async function getConsignacoesPorEntePublico(filters: ConsignacaoFilters) {
  const response = await api.get<{ data: { items: ConsignacaoPorEntePublicoItem[] } }>(
    '/dashboard/consignacoes/por-ente-publico',
    {
      params: buildParams(filters)
    }
  );
  return response.data.data.items ?? [];
}

export async function getConsignacoesInconsistencias(filters: ConsignacaoFilters) {
  const response = await api.get<{ data: ConsignacaoInconsistenciasResponse }>(
    '/dashboard/consignacoes/inconsistencias',
    {
      params: buildParams(filters)
    }
  );
  return response.data.data;
}
