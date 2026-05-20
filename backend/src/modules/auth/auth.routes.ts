import type { FastifyInstance } from 'fastify';
import { meController, loginController } from './auth.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', loginController);
  app.get('/me', { preHandler: authMiddleware }, meController);
}
