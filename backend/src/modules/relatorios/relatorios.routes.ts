import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { relatoriosPreviewController } from './relatorios.controller';

export async function relatoriosRoutes(app: FastifyInstance) {
  app.post('/preview', { preHandler: authMiddleware }, relatoriosPreviewController);
}
