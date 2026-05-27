import type { FastifyInstance } from 'fastify';
import {
  dashboardDetalhesController,
  dashboardFiliacaoSituacaoDesfiliadosDistribuicaoController,
  dashboardFiliacaoSituacaoDesfiliadosRegiaoEsferaSexoDistribuicaoController,
  dashboardFiliacaoSituacaoDesfiliadosRegiaoEsferaDistribuicaoController,
  dashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoController,
  dashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasController,
  dashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciasController,
  dashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoController,
  dashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoController,
  dashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoController,
  dashboardFiliacaoSituacaoRegiaoInconsistenciasController,
  dashboardFiliacaoSituacaoRegiaoDistribuicaoController,
  dashboardFiliacaoSituacaoSexoInconsistenciasController,
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
    '/filiacao-situacao-sexo-inconsistencias',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoSexoInconsistenciasController
  );
  app.get(
    '/filiacao-situacao-regiao-distribuicao',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoRegiaoDistribuicaoController
  );
  app.get(
    '/filiacao-situacao-regiao-esfera-distribuicao',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoController
  );
  app.get(
    '/filiacao-situacao-regiao-esfera-sexo-distribuicao',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoController
  );
  app.get(
    '/filiacao-situacao-regiao-inconsistencias',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoRegiaoInconsistenciasController
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
  app.get(
    '/filiacao-situacao-desfiliados-sexo-inconsistencias',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciasController
  );
  app.get(
    '/filiacao-situacao-desfiliados-regiao-distribuicao',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoController
  );
  app.get(
    '/filiacao-situacao-desfiliados-regiao-esfera-distribuicao',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoDesfiliadosRegiaoEsferaDistribuicaoController
  );
  app.get(
    '/filiacao-situacao-desfiliados-regiao-esfera-sexo-distribuicao',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoDesfiliadosRegiaoEsferaSexoDistribuicaoController
  );
  app.get(
    '/filiacao-situacao-desfiliados-regiao-inconsistencias',
    { preHandler: authMiddleware },
    dashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasController
  );
  app.get('/detalhes', { preHandler: authMiddleware }, dashboardDetalhesController);
}
