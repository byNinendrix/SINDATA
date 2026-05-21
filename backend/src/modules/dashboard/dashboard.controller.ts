import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { errorResponse, successResponse } from '../../shared/utils/response';
import { DashboardService, type DashboardDetalheCardKey } from './dashboard.service';

const dashboardService = new DashboardService();

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

export async function dashboardResumoController(_request: FastifyRequest, reply: FastifyReply) {
  const resumo = await dashboardService.getResumo();

  return successResponse(reply, resumo, 'Resumo carregado com sucesso.');
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
