import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { authRoutes } from './modules/auth/auth.routes';
import { configuracoesRoutes } from './modules/configuracoes/configuracoes.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { successResponse } from './shared/utils/response';

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true
  });

  await app.register(helmet, {
    contentSecurityPolicy: false
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET
  });

  app.get('/api/health', async (_request, reply) => {
    return successResponse(
      reply,
      {
        status: 'ok',
        timestamp: new Date().toISOString()
      },
      'API online.'
    );
  });

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  await app.register(configuracoesRoutes, { prefix: '/api/configuracoes' });

  const frontendDist = path.resolve(process.cwd(), '../frontend/dist');
  const hasFrontendBuild = fs.existsSync(frontendDist);

  if (hasFrontendBuild) {
    await app.register(fastifyStatic, {
      root: frontendDist,
      prefix: '/',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-store');
          return;
        }

        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    });

    app.get('/', (_request, reply) => {
      return reply.header('Cache-Control', 'no-store').type('text/html').sendFile('index.html');
    });

    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api')) {
        return reply.status(404).send({
          success: false,
          message: 'Rota não encontrada.'
        });
      }

      const pathWithoutQuery = request.url.split('?')[0];
      const isAssetRequest = pathWithoutQuery.startsWith('/assets/');
      const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(pathWithoutQuery);

      if (isAssetRequest || hasFileExtension) {
        return reply.status(404).send({
          success: false,
          message: 'Arquivo estático não encontrado.'
        });
      }

      return reply.header('Cache-Control', 'no-store').type('text/html').sendFile('index.html');
    });
  }

  return app;
}
