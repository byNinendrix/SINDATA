import { getSqlPool, sql } from '../../database/sqlserver';
import { queryReadOnly } from '../../database/readOnlyGuard';
import type { UsuarioRecord } from './auth.types';

export class AuthRepository {
  async findByLogin(login: string): Promise<UsuarioRecord | null> {
    const pool = await getSqlPool();

    const request = pool.request().input('login', sql.VarChar(120), login);
    const result = await queryReadOnly<UsuarioRecord>(
      request,
      `
        SELECT
          USR_CODIGO,
          USR_LOGIN,
          USR_SENHA
        FROM FR_USUARIO
        WHERE LOWER(USR_LOGIN) = LOWER(@login)
      `
    );

    return result.recordset[0] ?? null;
  }
}
