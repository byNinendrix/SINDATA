import { getSqlPool, sql } from '../../database/sqlserver';
import { queryReadOnly } from '../../database/readOnlyGuard';

export interface DashboardResumo {
  totalPessoas: number;
  filiadosAtivos: number;
  desfiliados: number;
  contribuintes: number;
  totalFiliacoes: number;
  totalFiliacoesAtivas: number;
  totalFiliacoesDesfiliadas: number;
  totalFiliacoesSemVinculoPessoa: number;
}

export type DashboardDetalheCardKey =
  | 'totalPessoas'
  | 'pessoasFiliadasAtivas'
  | 'pessoasDesfiliadas'
  | 'pessoasSemRegistroFiliacao'
  | 'totalFiliacoes'
  | 'filiacoesAtivas'
  | 'filiacoesDesfiliadas'
  | 'filiacoesSemVinculoPessoa';

export interface DashboardDetalheItem {
  cpf: string;
  nome: string;
}

export interface DashboardDetalhesPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DashboardDetalhesResponse {
  items: DashboardDetalheItem[];
  pagination: DashboardDetalhesPagination;
}

export interface DashboardSexoDistribuicaoItem {
  genero: string;
  descricao: string;
  totalPessoasQtd: number;
  totalPessoasPercentual: number;
  pessoasFiliadasAtivasQtd: number;
  pessoasFiliadasAtivasPercentual: number;
  pessoasDesfiliadasQtd: number;
  pessoasDesfiliadasPercentual: number;
  pessoasSemRegistroFiliacaoQtd: number;
  pessoasSemRegistroFiliacaoPercentual: number;
}

export interface DashboardSexoDistribuicaoResponse {
  items: DashboardSexoDistribuicaoItem[];
}

export interface DashboardFiliacaoSituacaoDistribuicaoItem {
  codigo: string;
  descricao: string;
  totalFiliacoesQtd: number;
  totalFiliacoesPercentual: number;
}

export interface DashboardFiliacaoSituacaoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoDistribuicaoItem[];
}

export interface DashboardFiliacaoSituacaoSexoDistribuicaoItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  genero: string;
  generoDescricao: string;
  totalQtd: number;
  totalPercentual: number;
}

export interface DashboardFiliacaoSituacaoSexoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoSexoDistribuicaoItem[];
}

export interface DashboardFiliacaoSituacaoDesfiliadosDistribuicaoItem {
  codigo: string;
  descricao: string;
  totalDesfiliadosQtd: number;
  totalDesfiliadosPercentual: number;
}

export interface DashboardFiliacaoSituacaoDesfiliadosDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoDesfiliadosDistribuicaoItem[];
}

export interface DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  genero: string;
  generoDescricao: string;
  totalQtd: number;
  totalPercentual: number;
}

export interface DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoItem[];
}

interface TotalPessoasRow {
  totalPessoas: number | string;
  filiadosAtivos: number | string;
  desfiliados: number | string;
  contribuintes: number | string;
  totalFiliacoes: number | string;
  totalFiliacoesAtivas: number | string;
  totalFiliacoesDesfiliadas: number | string;
  totalFiliacoesSemVinculoPessoa: number | string;
}

interface DashboardDetalheCountRow {
  total: number | string;
}

interface DashboardDetalheRow {
  CPF: string | null;
  NOME: string | null;
}

interface DashboardSexoDistribuicaoRow {
  genero: string | null;
  descricao: string | null;
  totalPessoasQtd: number | string;
  pessoasFiliadasAtivasQtd: number | string;
  pessoasDesfiliadasQtd: number | string;
  pessoasSemRegistroFiliacaoQtd: number | string;
}

interface DashboardFiliacaoSituacaoDistribuicaoRow {
  codigo: string | null;
  descricao: string | null;
  totalFiliacoesQtd: number | string;
}

interface DashboardFiliacaoSituacaoSexoDistribuicaoRow {
  situacaoCodigo: string | null;
  situacaoDescricao: string | null;
  genero: string | null;
  generoDescricao: string | null;
  totalQtd: number | string;
  totalSituacaoQtd: number | string;
}

interface DashboardFiliacaoSituacaoDesfiliadosDistribuicaoRow {
  codigo: string | null;
  descricao: string | null;
  totalDesfiliadosQtd: number | string;
}

interface DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoRow {
  situacaoCodigo: string | null;
  situacaoDescricao: string | null;
  genero: string | null;
  generoDescricao: string | null;
  totalQtd: number | string;
  totalSituacaoQtd: number | string;
}

export class DashboardService {
  private cacheResumo: DashboardResumo | null = null;

  private cacheTimestamp = 0;

  private readonly cacheTtlMs = 30_000;

  private parseSqlNumber(value: number | string): number {
    if (typeof value === 'number') {
      return value;
    }

    return Number.parseInt(value, 10) || 0;
  }

  private normalizePage(value: number): number {
    if (!Number.isFinite(value) || value < 1) {
      return 1;
    }

    return Math.floor(value);
  }

  private normalizePageSize(value: number): number {
    if (!Number.isFinite(value) || value < 1) {
      return 50;
    }

    return Math.min(Math.floor(value), 100);
  }

  private calculatePercentage(quantity: number, total: number): number {
    if (total <= 0) {
      return 0;
    }

    const percentage = (quantity / total) * 100;
    return Number(percentage.toFixed(2));
  }

  private getBaseQueryByCard(cardKey: DashboardDetalheCardKey): string {
    switch (cardKey) {
      case 'totalPessoas':
        return `
          SELECT
            p.CPF AS CPF,
            p.NOME AS NOME
          FROM dbo.PESSOAS AS p
        `;
      case 'pessoasFiliadasAtivas':
        return `
          SELECT
            p.CPF AS CPF,
            p.NOME AS NOME
          FROM dbo.PESSOAS AS p
          WHERE EXISTS (
            SELECT 1
            FROM dbo.FILIADO AS f
            WHERE f.CPF = p.CPF
              AND f.ASSOCIADO = -1
          )
        `;
      case 'pessoasDesfiliadas':
        return `
          SELECT
            p.CPF AS CPF,
            p.NOME AS NOME
          FROM dbo.PESSOAS AS p
          WHERE EXISTS (
            SELECT 1
            FROM dbo.FILIADO AS f
            WHERE f.CPF = p.CPF
              AND f.ASSOCIADO = 0
          )
            AND NOT EXISTS (
              SELECT 1
              FROM dbo.FILIADO AS f
              WHERE f.CPF = p.CPF
                AND f.ASSOCIADO = -1
            )
        `;
      case 'pessoasSemRegistroFiliacao':
        return `
          SELECT
            p.CPF AS CPF,
            p.NOME AS NOME
          FROM dbo.PESSOAS AS p
          WHERE NOT EXISTS (
            SELECT 1
            FROM dbo.FILIADO AS f
            WHERE f.CPF = p.CPF
          )
        `;
      case 'totalFiliacoes':
        return `
          SELECT
            f.CPF AS CPF,
            p.NOME AS NOME
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
        `;
      case 'filiacoesAtivas':
        return `
          SELECT
            f.CPF AS CPF,
            p.NOME AS NOME
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          WHERE f.ASSOCIADO = -1
        `;
      case 'filiacoesDesfiliadas':
        return `
          SELECT
            f.CPF AS CPF,
            p.NOME AS NOME
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          WHERE f.ASSOCIADO = 0
        `;
      case 'filiacoesSemVinculoPessoa':
        return `
          SELECT
            f.CPF AS CPF,
            CAST('Sem vínculo em PESSOAS' AS VARCHAR(255)) AS NOME
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          WHERE p.CPF IS NULL
        `;
      default:
        return `
          SELECT
            p.CPF AS CPF,
            p.NOME AS NOME
          FROM dbo.PESSOAS AS p
          WHERE 1 = 0
        `;
    }
  }

  async getDetalhes(
    cardKey: DashboardDetalheCardKey,
    rawSearch: string,
    rawPage: number,
    rawPageSize: number
  ): Promise<DashboardDetalhesResponse> {
    const search = rawSearch.trim();
    const page = this.normalizePage(rawPage);
    const pageSize = this.normalizePageSize(rawPageSize);
    const offset = (page - 1) * pageSize;

    const baseQuery = this.getBaseQueryByCard(cardKey);
    const filteredCte = `
      WITH Base AS (
        ${baseQuery}
      ),
      Filtered AS (
        SELECT
          LTRIM(RTRIM(CAST(Base.CPF AS VARCHAR(32)))) AS CPF,
          LTRIM(RTRIM(CAST(ISNULL(Base.NOME, '') AS VARCHAR(255)))) AS NOME
        FROM Base
        WHERE LTRIM(RTRIM(CAST(ISNULL(Base.CPF, '') AS VARCHAR(32)))) <> ''
      )
    `;

    const pool = await getSqlPool();
    const countRequest = pool
      .request()
      .input('search', sql.VarChar(120), search)
      .input('searchLike', sql.VarChar(130), `%${search}%`);

    const countQuery = `
      ${filteredCte}
      SELECT COUNT_BIG(1) AS total
      FROM Filtered
      WHERE (@search = '' OR Filtered.CPF LIKE @searchLike OR Filtered.NOME LIKE @searchLike)
    `;

    const countResult = await queryReadOnly<DashboardDetalheCountRow>(countRequest, countQuery);
    const total = this.parseSqlNumber(countResult.recordset[0]?.total ?? 0);

    const dataRequest = pool
      .request()
      .input('search', sql.VarChar(120), search)
      .input('searchLike', sql.VarChar(130), `%${search}%`)
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize);

    const dataQuery = `
      ${filteredCte}
      SELECT
        Filtered.CPF,
        Filtered.NOME
      FROM Filtered
      WHERE (@search = '' OR Filtered.CPF LIKE @searchLike OR Filtered.NOME LIKE @searchLike)
      ORDER BY Filtered.NOME ASC, Filtered.CPF ASC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `;

    const dataResult = await queryReadOnly<DashboardDetalheRow>(dataRequest, dataQuery);
    const items: DashboardDetalheItem[] = dataResult.recordset.map((row) => ({
      cpf: String(row.CPF ?? ''),
      nome: String(row.NOME ?? '')
    }));

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: total > 0 ? Math.ceil(total / pageSize) : 0
      }
    };
  }

  async getResumo(): Promise<DashboardResumo> {
    const now = Date.now();
    if (this.cacheResumo && now - this.cacheTimestamp < this.cacheTtlMs) {
      return this.cacheResumo;
    }

    const pool = await getSqlPool();
    const result = await queryReadOnly<TotalPessoasRow>(
      pool.request(),
      `
        SELECT
          (SELECT COUNT_BIG(1) FROM dbo.PESSOAS) AS totalPessoas,
          (
            SELECT COUNT_BIG(1)
            FROM dbo.PESSOAS AS p
            WHERE EXISTS (
              SELECT 1
              FROM dbo.FILIADO AS f
              WHERE f.CPF = p.CPF
                AND f.ASSOCIADO = -1
            )
          ) AS filiadosAtivos,
          (
            SELECT COUNT_BIG(1)
            FROM dbo.PESSOAS AS p
            WHERE EXISTS (
              SELECT 1
              FROM dbo.FILIADO AS f
              WHERE f.CPF = p.CPF
                AND f.ASSOCIADO = 0
            )
            AND NOT EXISTS (
              SELECT 1
              FROM dbo.FILIADO AS f
              WHERE f.CPF = p.CPF
                AND f.ASSOCIADO = -1
            )
          ) AS desfiliados,
          (
            SELECT COUNT_BIG(1)
            FROM dbo.PESSOAS AS p
            WHERE NOT EXISTS (
              SELECT 1
              FROM dbo.FILIADO AS f
              WHERE f.CPF = p.CPF
            )
          ) AS contribuintes,
          (
            SELECT COUNT_BIG(1)
            FROM dbo.FILIADO
          ) AS totalFiliacoes,
          (
            SELECT COUNT_BIG(1)
            FROM dbo.FILIADO
            WHERE ASSOCIADO = -1
          ) AS totalFiliacoesAtivas,
          (
            SELECT COUNT_BIG(1)
            FROM dbo.FILIADO
            WHERE ASSOCIADO = 0
          ) AS totalFiliacoesDesfiliadas,
          (
            SELECT COUNT_BIG(1)
            FROM dbo.FILIADO AS f
            WHERE NOT EXISTS (
              SELECT 1
              FROM dbo.PESSOAS AS p
              WHERE p.CPF = f.CPF
            )
          ) AS totalFiliacoesSemVinculoPessoa
      `
    );

    const totalPessoasRaw = result.recordset[0]?.totalPessoas ?? 0;
    const totalPessoas = this.parseSqlNumber(totalPessoasRaw);
    const filiadosAtivosRaw = result.recordset[0]?.filiadosAtivos ?? 0;
    const filiadosAtivos = this.parseSqlNumber(filiadosAtivosRaw);
    const desfiliadosRaw = result.recordset[0]?.desfiliados ?? 0;
    const desfiliados = this.parseSqlNumber(desfiliadosRaw);
    const contribuintesRaw = result.recordset[0]?.contribuintes ?? 0;
    const contribuintes = this.parseSqlNumber(contribuintesRaw);
    const totalFiliacoesRaw = result.recordset[0]?.totalFiliacoes ?? 0;
    const totalFiliacoes = this.parseSqlNumber(totalFiliacoesRaw);
    const totalFiliacoesAtivasRaw = result.recordset[0]?.totalFiliacoesAtivas ?? 0;
    const totalFiliacoesAtivas = this.parseSqlNumber(totalFiliacoesAtivasRaw);
    const totalFiliacoesDesfiliadasRaw = result.recordset[0]?.totalFiliacoesDesfiliadas ?? 0;
    const totalFiliacoesDesfiliadas = this.parseSqlNumber(totalFiliacoesDesfiliadasRaw);
    const totalFiliacoesSemVinculoPessoaRaw = result.recordset[0]?.totalFiliacoesSemVinculoPessoa ?? 0;
    const totalFiliacoesSemVinculoPessoa = this.parseSqlNumber(totalFiliacoesSemVinculoPessoaRaw);

    const resumo: DashboardResumo = {
      totalPessoas,
      filiadosAtivos,
      desfiliados,
      contribuintes,
      totalFiliacoes,
      totalFiliacoesAtivas,
      totalFiliacoesDesfiliadas,
      totalFiliacoesSemVinculoPessoa
    };

    this.cacheResumo = resumo;
    this.cacheTimestamp = now;

    return {
      ...resumo
    };
  }

  async getSexoDistribuicao(): Promise<DashboardSexoDistribuicaoResponse> {
    const resumo = await this.getResumo();
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardSexoDistribuicaoRow>(
      pool.request(),
      `
        WITH PessoasClassificadas AS (
          SELECT
            p.CPF,
            p.SEXO,
            CASE
              WHEN EXISTS (
                SELECT 1
                FROM dbo.FILIADO AS f
                WHERE f.CPF = p.CPF
                  AND f.ASSOCIADO = -1
              ) THEN 1
              ELSE 0
            END AS IsFiliadoAtivo,
            CASE
              WHEN EXISTS (
                SELECT 1
                FROM dbo.FILIADO AS f
                WHERE f.CPF = p.CPF
                  AND f.ASSOCIADO = 0
              )
              AND NOT EXISTS (
                SELECT 1
                FROM dbo.FILIADO AS f
                WHERE f.CPF = p.CPF
                  AND f.ASSOCIADO = -1
              ) THEN 1
              ELSE 0
            END AS IsDesfiliado,
            CASE
              WHEN NOT EXISTS (
                SELECT 1
                FROM dbo.FILIADO AS f
                WHERE f.CPF = p.CPF
              ) THEN 1
              ELSE 0
            END AS IsSemRegistroFiliacao
          FROM dbo.PESSOAS AS p
        )
        SELECT
          g.GENERO AS genero,
          g.DESCRICAO AS descricao,
          COUNT_BIG(pc.CPF) AS totalPessoasQtd,
          SUM(CASE WHEN pc.IsFiliadoAtivo = 1 THEN 1 ELSE 0 END) AS pessoasFiliadasAtivasQtd,
          SUM(CASE WHEN pc.IsDesfiliado = 1 THEN 1 ELSE 0 END) AS pessoasDesfiliadasQtd,
          SUM(CASE WHEN pc.IsSemRegistroFiliacao = 1 THEN 1 ELSE 0 END) AS pessoasSemRegistroFiliacaoQtd
        FROM dbo.GENERO AS g
        LEFT JOIN PessoasClassificadas AS pc
          ON pc.SEXO = g.GENERO
        GROUP BY
          g.GENERO,
          g.DESCRICAO
        ORDER BY
          g.DESCRICAO ASC
      `
    );

    const items: DashboardSexoDistribuicaoItem[] = result.recordset.map((row) => {
      const totalPessoasQtd = this.parseSqlNumber(row.totalPessoasQtd ?? 0);
      const pessoasFiliadasAtivasQtd = this.parseSqlNumber(row.pessoasFiliadasAtivasQtd ?? 0);
      const pessoasDesfiliadasQtd = this.parseSqlNumber(row.pessoasDesfiliadasQtd ?? 0);
      const pessoasSemRegistroFiliacaoQtd = this.parseSqlNumber(row.pessoasSemRegistroFiliacaoQtd ?? 0);

      return {
        genero: String(row.genero ?? ''),
        descricao: String(row.descricao ?? ''),
        totalPessoasQtd,
        totalPessoasPercentual: this.calculatePercentage(totalPessoasQtd, resumo.totalPessoas),
        pessoasFiliadasAtivasQtd,
        pessoasFiliadasAtivasPercentual: this.calculatePercentage(pessoasFiliadasAtivasQtd, resumo.filiadosAtivos),
        pessoasDesfiliadasQtd,
        pessoasDesfiliadasPercentual: this.calculatePercentage(pessoasDesfiliadasQtd, resumo.desfiliados),
        pessoasSemRegistroFiliacaoQtd,
        pessoasSemRegistroFiliacaoPercentual: this.calculatePercentage(
          pessoasSemRegistroFiliacaoQtd,
          resumo.contribuintes
        )
      };
    });

    return {
      items
    };
  }

  async getFiliacaoSituacaoDistribuicao(): Promise<DashboardFiliacaoSituacaoDistribuicaoResponse> {
    const resumo = await this.getResumo();
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoDistribuicaoRow>(
      pool.request(),
      `
        SELECT
          sf.CODIGO AS codigo,
          sf.DESCRICAO AS descricao,
          COUNT_BIG(f.CPF) AS totalFiliacoesQtd
        FROM dbo.SITUACAO_FILIADO AS sf
        LEFT JOIN dbo.FILIADO AS f
          ON f.SITUACAO = sf.CODIGO
        WHERE sf.ATIVO = 1
        GROUP BY
          sf.CODIGO,
          sf.DESCRICAO
        ORDER BY
          sf.DESCRICAO ASC
      `
    );

    const items: DashboardFiliacaoSituacaoDistribuicaoItem[] = result.recordset.map((row) => {
      const totalFiliacoesQtd = this.parseSqlNumber(row.totalFiliacoesQtd ?? 0);

      return {
        codigo: String(row.codigo ?? ''),
        descricao: String(row.descricao ?? ''),
        totalFiliacoesQtd,
        totalFiliacoesPercentual: this.calculatePercentage(totalFiliacoesQtd, resumo.totalFiliacoes)
      };
    });

    return {
      items
    };
  }

  async getFiliacaoSituacaoSexoDistribuicao(): Promise<DashboardFiliacaoSituacaoSexoDistribuicaoResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoSexoDistribuicaoRow>(
      pool.request(),
      `
        WITH SituacoesAtivas AS (
          SELECT
            sf.CODIGO AS codigo,
            sf.DESCRICAO AS descricao
          FROM dbo.SITUACAO_FILIADO AS sf
          WHERE sf.ATIVO = 1
        ),
        Generos AS (
          SELECT
            g.GENERO AS genero,
            g.DESCRICAO AS descricao
          FROM dbo.GENERO AS g
        ),
        FiliacoesPorSituacaoSexo AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            p.SEXO AS genero,
            COUNT_BIG(1) AS totalQtd
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          GROUP BY
            f.SITUACAO,
            p.SEXO
        ),
        TotaisPorSituacao AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            COUNT_BIG(1) AS totalSituacaoQtd
          FROM dbo.FILIADO AS f
          GROUP BY
            f.SITUACAO
        )
        SELECT
          sa.codigo AS situacaoCodigo,
          sa.descricao AS situacaoDescricao,
          g.genero AS genero,
          g.descricao AS generoDescricao,
          ISNULL(fss.totalQtd, 0) AS totalQtd,
          ISNULL(ts.totalSituacaoQtd, 0) AS totalSituacaoQtd
        FROM SituacoesAtivas AS sa
        CROSS JOIN Generos AS g
        LEFT JOIN FiliacoesPorSituacaoSexo AS fss
          ON fss.situacaoCodigo = sa.codigo
          AND fss.genero = g.genero
        LEFT JOIN TotaisPorSituacao AS ts
          ON ts.situacaoCodigo = sa.codigo
        ORDER BY
          sa.descricao ASC,
          g.descricao ASC
      `
    );

    const items: DashboardFiliacaoSituacaoSexoDistribuicaoItem[] = result.recordset.map((row) => {
      const totalQtd = this.parseSqlNumber(row.totalQtd ?? 0);
      const totalSituacaoQtd = this.parseSqlNumber(row.totalSituacaoQtd ?? 0);

      return {
        situacaoCodigo: String(row.situacaoCodigo ?? ''),
        situacaoDescricao: String(row.situacaoDescricao ?? ''),
        genero: String(row.genero ?? ''),
        generoDescricao: String(row.generoDescricao ?? ''),
        totalQtd,
        totalPercentual: this.calculatePercentage(totalQtd, totalSituacaoQtd)
      };
    });

    return {
      items
    };
  }

  async getFiliacaoSituacaoDesfiliadosDistribuicao(): Promise<DashboardFiliacaoSituacaoDesfiliadosDistribuicaoResponse> {
    const resumo = await this.getResumo();
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoDesfiliadosDistribuicaoRow>(
      pool.request(),
      `
        SELECT
          sf.CODIGO AS codigo,
          sf.DESCRICAO AS descricao,
          COUNT_BIG(f.CPF) AS totalDesfiliadosQtd
        FROM dbo.SITUACAO_FILIADO AS sf
        LEFT JOIN dbo.FILIADO AS f
          ON f.SITUACAO = sf.CODIGO
          AND f.ASSOCIADO = 0
        WHERE sf.ATIVO = 1
        GROUP BY
          sf.CODIGO,
          sf.DESCRICAO
        ORDER BY
          sf.DESCRICAO ASC
      `
    );

    const items: DashboardFiliacaoSituacaoDesfiliadosDistribuicaoItem[] = result.recordset.map((row) => {
      const totalDesfiliadosQtd = this.parseSqlNumber(row.totalDesfiliadosQtd ?? 0);

      return {
        codigo: String(row.codigo ?? ''),
        descricao: String(row.descricao ?? ''),
        totalDesfiliadosQtd,
        totalDesfiliadosPercentual: this.calculatePercentage(totalDesfiliadosQtd, resumo.totalFiliacoesDesfiliadas)
      };
    });

    return {
      items
    };
  }

  async getFiliacaoSituacaoDesfiliadosSexoDistribuicao(): Promise<DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoRow>(
      pool.request(),
      `
        WITH SituacoesAtivas AS (
          SELECT
            sf.CODIGO AS codigo,
            sf.DESCRICAO AS descricao
          FROM dbo.SITUACAO_FILIADO AS sf
          WHERE sf.ATIVO = 1
        ),
        Generos AS (
          SELECT
            g.GENERO AS genero,
            g.DESCRICAO AS descricao
          FROM dbo.GENERO AS g
        ),
        DesfiliadosPorSituacaoSexo AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            p.SEXO AS genero,
            COUNT_BIG(1) AS totalQtd
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          WHERE f.ASSOCIADO = 0
          GROUP BY
            f.SITUACAO,
            p.SEXO
        ),
        TotaisDesfiliadosPorSituacao AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            COUNT_BIG(1) AS totalSituacaoQtd
          FROM dbo.FILIADO AS f
          WHERE f.ASSOCIADO = 0
          GROUP BY
            f.SITUACAO
        )
        SELECT
          sa.codigo AS situacaoCodigo,
          sa.descricao AS situacaoDescricao,
          g.genero AS genero,
          g.descricao AS generoDescricao,
          ISNULL(dss.totalQtd, 0) AS totalQtd,
          ISNULL(tds.totalSituacaoQtd, 0) AS totalSituacaoQtd
        FROM SituacoesAtivas AS sa
        CROSS JOIN Generos AS g
        LEFT JOIN DesfiliadosPorSituacaoSexo AS dss
          ON dss.situacaoCodigo = sa.codigo
          AND dss.genero = g.genero
        LEFT JOIN TotaisDesfiliadosPorSituacao AS tds
          ON tds.situacaoCodigo = sa.codigo
        ORDER BY
          sa.descricao ASC,
          g.descricao ASC
      `
    );

    const items: DashboardFiliacaoSituacaoDesfiliadosSexoDistribuicaoItem[] = result.recordset.map((row) => {
      const totalQtd = this.parseSqlNumber(row.totalQtd ?? 0);
      const totalSituacaoQtd = this.parseSqlNumber(row.totalSituacaoQtd ?? 0);

      return {
        situacaoCodigo: String(row.situacaoCodigo ?? ''),
        situacaoDescricao: String(row.situacaoDescricao ?? ''),
        genero: String(row.genero ?? ''),
        generoDescricao: String(row.generoDescricao ?? ''),
        totalQtd,
        totalPercentual: this.calculatePercentage(totalQtd, totalSituacaoQtd)
      };
    });

    return {
      items
    };
  }
}
