import type { FastifyInstance } from 'fastify';
import { dashboardResumoController } from './dashboard.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/resumo', { preHandler: authMiddleware }, dashboardResumoController);
}
