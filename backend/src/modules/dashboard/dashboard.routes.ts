import type { FastifyInstance } from 'fastify';
import {
  dashboardDetalhesController,
  dashboardFiliacaoSituacaoDesfiliadosDistribuicaoController,
  dashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoController,
  dashboardFiliacaoSituacaoDistribuicaoController,
  dashboardFiliacaoSituacaoSexoDistribuicaoController,
  dashboardResumoController,
  dashboardSexoDistribuicaoController
} from './dashboard.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/resumo', { preHandler: authMiddleware }, dashboardResumoController);
  app.get('/sexo-distribuicao', { preHandler: authMiddleware }, dashboardSexoDistribuicaoController);
  app.get(
    '/filiacao-situacao-distribuicao',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoDistribuicaoController
  );
  app.get(
    '/filiacao-situacao-sexo-distribuicao',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoSexoDistribuicaoController
  );
  app.get(
    '/filiacao-situacao-desfiliados-distribuicao',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoDesfiliadosDistribuicaoController
  );
  app.get(
    '/filiacao-situacao-desfiliados-sexo-distribuicao',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoController
  );
  app.get('/detalhes', { preHandler: authMiddleware }, dashboardDetalhesController);
}
