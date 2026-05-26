import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { getEntePublicoOpcoesController, saveEntePublicoController } from './configuracoes.controller';

export async function configuracoesRoutes(app: FastifyInstance) {
  app.get('/ente-publico/opcoes', { preHandler: authMiddleware }, getEntePublicoOpcoesController);
  app.post('/ente-publico', { preHandler: authMiddleware }, saveEntePublicoController);
}
