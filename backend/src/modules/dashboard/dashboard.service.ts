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
}
