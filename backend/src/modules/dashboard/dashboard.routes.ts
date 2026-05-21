import type { FastifyInstance } from 'fastify';
import { dashboardDetalhesController, dashboardResumoController } from './dashboard.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/resumo', { preHandler: authMiddleware }, dashboardResumoController);
  app.get('/detalhes', { preHandler: authMiddleware }, dashboardDetalhesController);
}
