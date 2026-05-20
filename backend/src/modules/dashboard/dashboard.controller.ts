import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../shared/utils/response';
import { DashboardService } from './dashboard.service';

const dashboardService = new DashboardService();

export async function dashboardResumoController(_request: FastifyRequest, reply: FastifyReply) {
  const resumo = await dashboardService.getResumo();

  return successResponse(reply, resumo, 'Resumo carregado com sucesso.');
}
