import { getSqlPool, sql } from '../../database/sqlserver';

export interface EntePublicoOpcaoItem {
  codigoEmpresa: string;
  descricaoEmpresa: string;
  codigoPredio: string;
  descricaoPredio: string;
  estadual: boolean;
}

export interface EntePublicoOpcoesResponse {
  items: EntePublicoOpcaoItem[];
}

export interface SaveEntePublicoPayload {
  codigoEmpresa: string;
  codigoPredio: string;
  estadual: boolean;
  usuario: string;
}

export class ConfiguracoesService {
  private async ensureTable() {
    const pool = await getSqlPool();
    await pool.request().query(`
      IF OBJECT_ID('dbo.SINDATA_CONFIG_PREDIO_ENTE_PUBLICO', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.SINDATA_CONFIG_PREDIO_ENTE_PUBLICO (
          CODIGO_EMPRESA VARCHAR(20) NOT NULL,
          CODIGO_PREDIO VARCHAR(20) NOT NULL,
          ESTADUAL BIT NOT NULL CONSTRAINT DF_SINDATA_CFG_PREDIO_ESTADUAL DEFAULT(0),
          USUARIO_ALTERACAO VARCHAR(120) NULL,
          DATA_ALTERACAO DATETIME2 NOT NULL CONSTRAINT DF_SINDATA_CFG_PREDIO_DATA DEFAULT(SYSDATETIME()),
          CONSTRAINT PK_SINDATA_CONFIG_PREDIO_ENTE_PUBLICO PRIMARY KEY (CODIGO_EMPRESA, CODIGO_PREDIO)
        );
      END
    `);
  }

  async getEntePublicoOpcoes(): Promise<EntePublicoOpcoesResponse> {
    await this.ensureTable();
    const pool = await getSqlPool();

    const result = await pool.request().query<{
      codigoEmpresa: string | null;
      descricaoEmpresa: string | null;
      codigoPredio: string | null;
      descricaoPredio: string | null;
      estadual: boolean | number | null;
    }>(`
      SELECT
        e.CODIGO AS codigoEmpresa,
        e.DESCRICAO AS descricaoEmpresa,
        p.CODIGO AS codigoPredio,
        p.DESCRICAO AS descricaoPredio,
        ISNULL(cfg.ESTADUAL, 0) AS estadual
      FROM dbo.EMPRESA AS e
      INNER JOIN dbo.PREDIO AS p
        ON p.CODIGO_EMPRESA = e.CODIGO
      LEFT JOIN dbo.SINDATA_CONFIG_PREDIO_ENTE_PUBLICO AS cfg
        ON cfg.CODIGO_EMPRESA = p.CODIGO_EMPRESA
        AND cfg.CODIGO_PREDIO = p.CODIGO
      ORDER BY
        e.DESCRICAO ASC,
        p.DESCRICAO ASC
    `);

    return {
      items: result.recordset.map((row) => ({
        codigoEmpresa: String(row.codigoEmpresa ?? ''),
        descricaoEmpresa: String(row.descricaoEmpresa ?? ''),
        codigoPredio: String(row.codigoPredio ?? ''),
        descricaoPredio: String(row.descricaoPredio ?? ''),
        estadual: Number(row.estadual ?? 0) === 1
      }))
    };
  }

  async saveEntePublico(payload: SaveEntePublicoPayload): Promise<void> {
    await this.ensureTable();
    const pool = await getSqlPool();

    await pool
      .request()
      .input('codigoEmpresa', sql.VarChar(20), payload.codigoEmpresa)
      .input('codigoPredio', sql.VarChar(20), payload.codigoPredio)
      .input('estadual', sql.Bit, payload.estadual ? 1 : 0)
      .input('usuario', sql.VarChar(120), payload.usuario)
      .query(`
        MERGE dbo.SINDATA_CONFIG_PREDIO_ENTE_PUBLICO AS target
        USING (
          SELECT
            @codigoEmpresa AS CODIGO_EMPRESA,
            @codigoPredio AS CODIGO_PREDIO
        ) AS source
          ON target.CODIGO_EMPRESA = source.CODIGO_EMPRESA
          AND target.CODIGO_PREDIO = source.CODIGO_PREDIO
        WHEN MATCHED THEN
          UPDATE SET
            ESTADUAL = @estadual,
            USUARIO_ALTERACAO = @usuario,
            DATA_ALTERACAO = SYSDATETIME()
        WHEN NOT MATCHED THEN
          INSERT (CODIGO_EMPRESA, CODIGO_PREDIO, ESTADUAL, USUARIO_ALTERACAO)
          VALUES (@codigoEmpresa, @codigoPredio, @estadual, @usuario);
      `);
  }
}
