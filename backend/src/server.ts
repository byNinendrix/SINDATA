import { buildApp } from './app';
import { env } from './config/env';
import { closeSqlPool } from './database/sqlserver';

async function bootstrap() {
  const app = await buildApp();

  try {
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0'
    });

    app.log.info(`API SINDATA ativa na porta ${env.PORT}.`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  const shutdown = async () => {
    try {
      await closeSqlPool();
      await app.close();
      process.exit(0);
    } catch (error) {
      app.log.error(error);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

void bootstrap();
