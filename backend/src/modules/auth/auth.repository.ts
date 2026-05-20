import { getSqlPool, sql } from '../../database/sqlserver';
import type { UsuarioRecord } from './auth.types';

export class AuthRepository {
  async findByLogin(login: string): Promise<UsuarioRecord | null> {
    const pool = await getSqlPool();

    const result = await pool
      .request()
      .input('login', sql.VarChar(120), login)
      .query<UsuarioRecord>(`
        SELECT
          USR_LOGIN,
          USR_SENHA
        FROM FR_USUARIO
        WHERE USR_LOGIN = @login
      `);

    return result.recordset[0] ?? null;
  }
}
