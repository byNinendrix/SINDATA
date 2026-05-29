export interface ConsignacaoFilters {
  ano?: number;
  mes?: number;
  regiao?: string;
  situacao?: string;
  codigoEmpresa?: string;
  periodoInicio?: string;
  periodoFim?: string;
}

export interface ConsignacaoResumoPeriodo {
  anoInicial: number | null;
  anoFinal: number | null;
  ultimoAnoDisponivel: number | null;
  ultimoMesDisponivel: number | null;
  anoReferencia: number | null;
  mesReferencia: number | null;
}

export interface ConsignacaoResumoResponse {
  totalContribuido: number;
  totalAnoAtual: number;
  totalMesAtual: number;
  mediaMensal: number;
  quantidadeRegistros: number;
  quantidadeContribuintes: number;
  periodo: ConsignacaoResumoPeriodo;
}

export interface ConsignacaoPorRegiaoItem {
  regiaoCodigo: string;
  regiaoDescricao: string;
  valorTotal: number;
  percentual: number;
  quantidadeRegistros: number;
  quantidadeContribuintes: number;
}

export interface ConsignacaoPorRegiaoResponse {
  items: ConsignacaoPorRegiaoItem[];
}

export interface ConsignacaoPorPeriodoItem {
  ano: number;
  mes: number;
  valorTotal: number;
  percentualAno: number;
  quantidadeRegistros: number;
  quantidadeContribuintes: number;
}

export interface ConsignacaoPorPeriodoResponse {
  items: ConsignacaoPorPeriodoItem[];
}

export interface ConsignacaoPorSituacaoItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  valorTotal: number;
  percentual: number;
  quantidadeRegistros: number;
  quantidadeContribuintes: number;
}

export interface ConsignacaoPorSituacaoResponse {
  items: ConsignacaoPorSituacaoItem[];
}

export interface ConsignacaoPorEntePublicoItem {
  codigoEmpresa: string;
  enteDescricao: string;
  valorTotal: number;
  percentual: number;
  quantidadeRegistros: number;
  quantidadeContribuintes: number;
}

export interface ConsignacaoPorEntePublicoResponse {
  items: ConsignacaoPorEntePublicoItem[];
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
