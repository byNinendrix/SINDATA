import sql, { type ConnectionPool, type config as SqlConfig } from 'mssql';
import { env } from '../config/env';

let pool: ConnectionPool | null = null;

const sqlConfig: SqlConfig = {
  server: env.DB_SERVER,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  options: {
    encrypt: env.DB_ENCRYPT,
    trustServerCertificate: env.DB_TRUST_SERVER_CERTIFICATE
  },
  connectionTimeout: 5000,
  requestTimeout: 15000,
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000
  }
};

export async function getSqlPool(): Promise<ConnectionPool> {
  if (pool) {
    return pool;
  }

  pool = await new sql.ConnectionPool(sqlConfig).connect();
  return pool;
}

export async function closeSqlPool(): Promise<void> {
  if (!pool) {
    return;
  }

  await pool.close();
  pool = null;
}

export { sql };
