import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../shared/utils/response';
import { DashboardService, type DashboardDetalheCardKey } from './dashboard.service';
import { DashboardConsignacoesService } from './dashboard.consignacoes.service';

const dashboardService = new DashboardService();
const dashboardConsignacoesService = new DashboardConsignacoesService();

const detalhesQuerySchema = z.object({
  cardKey: z.enum([
    'totalPessoas',
    'pessoasFiliadasAtivas',
    'pessoasDesfiliadas',
    'pessoasSemRegistroFiliacao',
    'totalFiliacoes',
    'filiacoesAtivas',
    'filiacoesDesfiliadas',
    'filiacoesSemVinculoPessoa'
  ]),
  search: z.string().default(''),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50)
});

const filiacaoSituacaoRegiaoEsferaQuerySchema = z.object({
  situacaoCodigo: z.string().trim().min(1),
  regiaoCodigo: z.string().trim().min(1)
});

const filiacaoSituacaoRegiaoEsferaSexoQuerySchema = z.object({
  situacaoCodigo: z.string().trim().min(1),
  regiaoCodigo: z.string().trim().min(1),
  esfera: z.string().trim().min(1)
});

const consignacoesQuerySchema = z.object({
  ano: z.coerce.number().int().min(1900).max(2999).optional(),
  mes: z.coerce.number().int().min(1).max(12).optional(),
  regiao: z.string().trim().min(1).max(10).optional(),
  situacao: z.string().trim().min(1).max(10).optional(),
  codigoEmpresa: z.string().trim().min(1).max(20).optional(),
  periodoInicio: z.string().trim().regex(/^\d{4}-\d{2}$/).optional(),
  periodoFim: z.string().trim().regex(/^\d{4}-\d{2}$/).optional()
});

export async function dashboardResumoController(_request: FastifyRequest, reply: FastifyReply) {
  const resumo = await dashboardService.getResumo();

  return successResponse(reply, resumo, 'Resumo carregado com sucesso.');
}

export async function dashboardSexoDistribuicaoController(_request: FastifyRequest, reply: FastifyReply) {
  const distribuicao = await dashboardService.getSexoDistribuicao();

  return successResponse(reply, distribuicao, 'Distribuição por sexo carregada com sucesso.');
}

export async function dashboardFiliacaoSituacaoDistribuicaoController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const distribuicao = await dashboardService.getFiliacaoSituacaoDistribuicao();

  return successResponse(reply, distribuicao, 'Distribuição por situação funcional carregada com sucesso.');
}

export async function dashboardFiliacaoSituacaoSexoDistribuicaoController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const distribuicao = await dashboardService.getFiliacaoSituacaoSexoDistribuicao();

  return successResponse(reply, distribuicao, 'Distribuição por sexo na situação funcional carregada com sucesso.');
}

export async function dashboardFiliacaoSituacaoSexoInconsistenciasController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const inconsistencias = await dashboardService.getFiliacaoSituacaoSexoInconsistencias();

  return successResponse(
    reply,
    inconsistencias,
    'Inconsistências de sexo na situação funcional carregadas com sucesso.'
  );
}

export async function dashboardFiliacaoSituacaoRegiaoDistribuicaoController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const distribuicao = await dashboardService.getFiliacaoSituacaoRegiaoDistribuicao();

  return successResponse(reply, distribuicao, 'Distribuição por região na situação funcional carregada com sucesso.');
}

export async function dashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedQuery = filiacaoSituacaoRegiaoEsferaQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para distribuição Estado/Município.', 400);
  }

  const { situacaoCodigo, regiaoCodigo } = parsedQuery.data;
  const distribuicao = await dashboardService.getFiliacaoSituacaoRegiaoEsferaDistribuicao(situacaoCodigo, regiaoCodigo);

  return successResponse(
    reply,
    distribuicao,
    'Distribuição Estado/Município por situação e região carregada com sucesso.'
  );
}

export async function dashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedQuery = filiacaoSituacaoRegiaoEsferaSexoQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para distribuição de sexo por Estado/Município.', 400);
  }

  const { situacaoCodigo, regiaoCodigo, esfera } = parsedQuery.data;
  const distribuicao = await dashboardService.getFiliacaoSituacaoRegiaoEsferaSexoDistribuicao(
    situacaoCodigo,
    regiaoCodigo,
    esfera
  );

  return successResponse(
    reply,
    distribuicao,
    'Distribuição de sexo por Estado/Município carregada com sucesso.'
  );
}

export async function dashboardFiliacaoSituacaoRegiaoInconsistenciasController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const inconsistencias = await dashboardService.getFiliacaoSituacaoRegiaoInconsistencias();

  return successResponse(
    reply,
    inconsistencias,
    'Inconsistências de região na situação funcional carregadas com sucesso.'
  );
}

export async function dashboardFiliacaoSituacaoDesfiliadosDistribuicaoController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const distribuicao = await dashboardService.getFiliacaoSituacaoDesfiliadosDistribuicao();

  return successResponse(
    reply,
    distribuicao,
    'Distribuição por situação de filiações desfiliadas carregada com sucesso.'
  );
}

export async function dashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const distribuicao = await dashboardService.getFiliacaoSituacaoDesfiliadosSexoDistribuicao();

  return successResponse(
    reply,
    distribuicao,
    'Distribuição por sexo na situação de filiações desfiliadas carregada com sucesso.'
  );
}

export async function dashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciasController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const inconsistencias = await dashboardService.getFiliacaoSituacaoDesfiliadosSexoInconsistencias();

  return successResponse(
    reply,
    inconsistencias,
    'Inconsistências de sexo na situação de filiações desfiliadas carregadas com sucesso.'
  );
}

export async function dashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const distribuicao = await dashboardService.getFiliacaoSituacaoDesfiliadosRegiaoDistribuicao();

  return successResponse(
    reply,
    distribuicao,
    'Distribuição por região na situação de filiações desfiliadas carregada com sucesso.'
  );
}

export async function dashboardFiliacaoSituacaoDesfiliadosRegiaoEsferaDistribuicaoController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedQuery = filiacaoSituacaoRegiaoEsferaQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para distribuição Estado/Município.', 400);
  }

  const { situacaoCodigo, regiaoCodigo } = parsedQuery.data;
  const distribuicao = await dashboardService.getFiliacaoSituacaoDesfiliadosRegiaoEsferaDistribuicao(
    situacaoCodigo,
    regiaoCodigo
  );

  return successResponse(
    reply,
    distribuicao,
    'Distribuição Estado/Município por situação e região dos desfiliados carregada com sucesso.'
  );
}

export async function dashboardFiliacaoSituacaoDesfiliadosRegiaoEsferaSexoDistribuicaoController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedQuery = filiacaoSituacaoRegiaoEsferaSexoQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para distribuição de sexo por Estado/Município.', 400);
  }

  const { situacaoCodigo, regiaoCodigo, esfera } = parsedQuery.data;
  const distribuicao = await dashboardService.getFiliacaoSituacaoDesfiliadosRegiaoEsferaSexoDistribuicao(
    situacaoCodigo,
    regiaoCodigo,
    esfera
  );

  return successResponse(
    reply,
    distribuicao,
    'Distribuição de sexo por Estado/Município dos desfiliados carregada com sucesso.'
  );
}

export async function dashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const inconsistencias = await dashboardService.getFiliacaoSituacaoDesfiliadosRegiaoInconsistencias();

  return successResponse(
    reply,
    inconsistencias,
    'Inconsistências de região na situação de filiações desfiliadas carregadas com sucesso.'
  );
}

export async function dashboardDetalhesController(request: FastifyRequest, reply: FastifyReply) {
  const parsedQuery = detalhesQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para consulta de detalhes.', 400);
  }

  const { cardKey, search, page, pageSize } = parsedQuery.data;
  const detalhes = await dashboardService.getDetalhes(
    cardKey as DashboardDetalheCardKey,
    search,
    page,
    pageSize
  );

  return successResponse(reply, detalhes, 'Detalhes carregados com sucesso.');
}

export async function dashboardConsignacoesResumoController(request: FastifyRequest, reply: FastifyReply) {
  const parsedQuery = consignacoesQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para resumo de consignações.', 400);
  }

  const data = await dashboardConsignacoesService.getResumo(parsedQuery.data);
  return successResponse(reply, data, 'Resumo de consignações carregado com sucesso.');
}

export async function dashboardConsignacoesPorRegiaoController(request: FastifyRequest, reply: FastifyReply) {
  const parsedQuery = consignacoesQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para distribuição de consignações por região.', 400);
  }

  const data = await dashboardConsignacoesService.getPorRegiao(parsedQuery.data);
  return successResponse(reply, data, 'Distribuição de consignações por região carregada com sucesso.');
}

export async function dashboardConsignacoesPorPeriodoController(request: FastifyRequest, reply: FastifyReply) {
  const parsedQuery = consignacoesQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para distribuição de consignações por período.', 400);
  }

  const data = await dashboardConsignacoesService.getPorPeriodo(parsedQuery.data);
  return successResponse(reply, data, 'Distribuição de consignações por período carregada com sucesso.');
}

export async function dashboardConsignacoesPorSituacaoController(request: FastifyRequest, reply: FastifyReply) {
  const parsedQuery = consignacoesQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para distribuição de consignações por situação.', 400);
  }

  const data = await dashboardConsignacoesService.getPorSituacao(parsedQuery.data);
  return successResponse(reply, data, 'Distribuição de consignações por situação carregada com sucesso.');
}

export async function dashboardConsignacoesPorEntePublicoController(request: FastifyRequest, reply: FastifyReply) {
  const parsedQuery = consignacoesQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para distribuição de consignações por ente público.', 400);
  }

  const data = await dashboardConsignacoesService.getPorEntePublico(parsedQuery.data);
  return successResponse(reply, data, 'Distribuição de consignações por ente público carregada com sucesso.');
}

export async function dashboardConsignacoesInconsistenciasController(request: FastifyRequest, reply: FastifyReply) {
  const parsedQuery = consignacoesQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    return errorResponse(reply, 'Parâmetros inválidos para inconsistências de consignações.', 400);
  }

  const data = await dashboardConsignacoesService.getInconsistencias(parsedQuery.data);
  return successResponse(reply, data, 'Inconsistências de consignações carregadas com sucesso.');
}
