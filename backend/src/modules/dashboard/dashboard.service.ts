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

export interface DashboardFiliacaoSituacaoSexoInconsistenciaItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  cpf: string;
  nome: string;
  motivo: string;
}

export interface DashboardFiliacaoSituacaoSexoInconsistenciasResponse {
  items: DashboardFiliacaoSituacaoSexoInconsistenciaItem[];
}

export interface DashboardFiliacaoSituacaoRegiaoDistribuicaoItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  regiaoCodigo: string;
  regiaoDescricao: string;
  totalQtd: number;
  totalPercentual: number;
}

export interface DashboardFiliacaoSituacaoRegiaoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoRegiaoDistribuicaoItem[];
}

export interface DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoItem {
  esfera: string;
  totalQtd: number;
  totalPercentual: number;
}

export interface DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoItem[];
}

export interface DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoItem {
  esfera: string;
  genero: string;
  generoDescricao: string;
  totalQtd: number;
  totalPercentual: number;
}

export interface DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoItem[];
}

export interface DashboardFiliacaoSituacaoRegiaoInconsistenciaItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  cpf: string;
  nome: string;
  motivo: string;
}

export interface DashboardFiliacaoSituacaoRegiaoInconsistenciasResponse {
  items: DashboardFiliacaoSituacaoRegiaoInconsistenciaItem[];
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

export interface DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciaItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  cpf: string;
  nome: string;
  motivo: string;
}

export interface DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciasResponse {
  items: DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciaItem[];
}

export interface DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  regiaoCodigo: string;
  regiaoDescricao: string;
  totalQtd: number;
  totalPercentual: number;
}

export interface DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoResponse {
  items: DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoItem[];
}

export interface DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaItem {
  situacaoCodigo: string;
  situacaoDescricao: string;
  cpf: string;
  nome: string;
  motivo: string;
}

export interface DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasResponse {
  items: DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaItem[];
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

interface DashboardFiliacaoSituacaoSexoInconsistenciaRow {
  situacaoCodigo: string | null;
  situacaoDescricao: string | null;
  cpf: string | null;
  nome: string | null;
  motivo: string | null;
}

interface DashboardFiliacaoSituacaoRegiaoDistribuicaoRow {
  situacaoCodigo: string | null;
  situacaoDescricao: string | null;
  regiaoCodigo: string | null;
  regiaoDescricao: string | null;
  totalQtd: number | string;
  totalSituacaoQtd: number | string;
}

interface DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoRow {
  esfera: string | null;
  totalQtd: number | string;
  totalGeralQtd: number | string;
}

interface DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoRow {
  esfera: string | null;
  genero: string | null;
  generoDescricao: string | null;
  totalQtd: number | string;
  totalEsferaQtd: number | string;
}

interface DashboardFiliacaoSituacaoRegiaoInconsistenciaRow {
  situacaoCodigo: string | null;
  situacaoDescricao: string | null;
  cpf: string | null;
  nome: string | null;
  motivo: string | null;
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

interface DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciaRow {
  situacaoCodigo: string | null;
  situacaoDescricao: string | null;
  cpf: string | null;
  nome: string | null;
  motivo: string | null;
}

interface DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoRow {
  situacaoCodigo: string | null;
  situacaoDescricao: string | null;
  regiaoCodigo: string | null;
  regiaoDescricao: string | null;
  totalQtd: number | string;
  totalSituacaoQtd: number | string;
}

interface DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaRow {
  situacaoCodigo: string | null;
  situacaoDescricao: string | null;
  cpf: string | null;
  nome: string | null;
  motivo: string | null;
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
          AND f.ASSOCIADO = -1
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
        totalFiliacoesPercentual: this.calculatePercentage(totalFiliacoesQtd, resumo.totalFiliacoesAtivas)
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
          WHERE f.ASSOCIADO = -1
          GROUP BY
            f.SITUACAO,
            p.SEXO
        ),
        TotaisPorSituacao AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            COUNT_BIG(1) AS totalSituacaoQtd
          FROM dbo.FILIADO AS f
          WHERE f.ASSOCIADO = -1
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

  async getFiliacaoSituacaoSexoInconsistencias(): Promise<DashboardFiliacaoSituacaoSexoInconsistenciasResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoSexoInconsistenciaRow>(
      pool.request(),
      `
        WITH Base AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            sf.DESCRICAO AS situacaoDescricao,
            f.CPF AS cpf,
            p.NOME AS nome,
            p.CPF AS pessoaCpf,
            p.SEXO AS sexoPessoa,
            g.GENERO AS generoValido
          FROM dbo.FILIADO AS f
          INNER JOIN dbo.SITUACAO_FILIADO AS sf
            ON sf.CODIGO = f.SITUACAO
            AND sf.ATIVO = 1
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          LEFT JOIN dbo.GENERO AS g
            ON g.GENERO = p.SEXO
          WHERE f.ASSOCIADO = -1
            AND p.CPF IS NOT NULL
        )
        SELECT
          b.situacaoCodigo,
          b.situacaoDescricao,
          b.cpf,
          b.nome,
          CASE
            WHEN NULLIF(LTRIM(RTRIM(COALESCE(b.sexoPessoa, ''))), '') IS NULL THEN 'Pessoa sem sexo informado.'
            WHEN b.generoValido IS NULL THEN 'Sexo da pessoa sem correspondência na tabela GENERO.'
            ELSE 'Inconsistência de sexo.'
          END AS motivo
        FROM Base AS b
        WHERE
          NULLIF(LTRIM(RTRIM(COALESCE(b.sexoPessoa, ''))), '') IS NULL
          OR b.generoValido IS NULL
        ORDER BY
          b.situacaoDescricao ASC,
          b.nome ASC,
          b.cpf ASC
      `
    );

    const items: DashboardFiliacaoSituacaoSexoInconsistenciaItem[] = result.recordset.map((row) => ({
      situacaoCodigo: String(row.situacaoCodigo ?? ''),
      situacaoDescricao: String(row.situacaoDescricao ?? ''),
      cpf: String(row.cpf ?? ''),
      nome: String(row.nome ?? ''),
      motivo: String(row.motivo ?? '')
    }));

    return { items };
  }

  async getFiliacaoSituacaoRegiaoDistribuicao(): Promise<DashboardFiliacaoSituacaoRegiaoDistribuicaoResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoRegiaoDistribuicaoRow>(
      pool.request(),
      `
        WITH SituacoesAtivas AS (
          SELECT
            sf.CODIGO AS codigo,
            sf.DESCRICAO AS descricao
          FROM dbo.SITUACAO_FILIADO AS sf
          WHERE sf.ATIVO = 1
        ),
        Regioes AS (
          SELECT
            r.CODIGO AS codigo,
            r.DESCRICAO AS descricao
          FROM dbo.REGIAO AS r
        ),
        FiliacoesAtivasPorSituacaoRegiao AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            CASE
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '1' THEN pr.REGIAO
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '3' THEN gc.REGIAO
              ELSE pr.REGIAO
            END AS regiaoCodigo,
            COUNT_BIG(1) AS totalQtd
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PREDIO AS pr
            ON pr.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND pr.CODIGO = f.CODIGO_PREDIO
          LEFT JOIN dbo.PESSOAS AS pe
            ON pe.CPF = f.CPF
          LEFT JOIN dbo.GLO_CIDADE AS gc
            ON gc.UF = pe.ESTADO
            AND gc.CIDADE = pe.CIDADE
          WHERE f.ASSOCIADO = -1
          GROUP BY
            f.SITUACAO,
            CASE
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '1' THEN pr.REGIAO
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '3' THEN gc.REGIAO
              ELSE pr.REGIAO
            END
        ),
        TotaisAtivosPorSituacao AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            COUNT_BIG(1) AS totalSituacaoQtd
          FROM dbo.FILIADO AS f
          WHERE f.ASSOCIADO = -1
          GROUP BY
            f.SITUACAO
        )
        SELECT
          sa.codigo AS situacaoCodigo,
          sa.descricao AS situacaoDescricao,
          r.codigo AS regiaoCodigo,
          r.descricao AS regiaoDescricao,
          ISNULL(fsr.totalQtd, 0) AS totalQtd,
          ISNULL(tas.totalSituacaoQtd, 0) AS totalSituacaoQtd
        FROM SituacoesAtivas AS sa
        CROSS JOIN Regioes AS r
        LEFT JOIN FiliacoesAtivasPorSituacaoRegiao AS fsr
          ON fsr.situacaoCodigo = sa.codigo
          AND fsr.regiaoCodigo = r.codigo
        LEFT JOIN TotaisAtivosPorSituacao AS tas
          ON tas.situacaoCodigo = sa.codigo
        ORDER BY
          sa.descricao ASC,
          r.descricao ASC
      `
    );

    const items: DashboardFiliacaoSituacaoRegiaoDistribuicaoItem[] = result.recordset.map((row) => {
      const totalQtd = this.parseSqlNumber(row.totalQtd ?? 0);
      const totalSituacaoQtd = this.parseSqlNumber(row.totalSituacaoQtd ?? 0);

      return {
        situacaoCodigo: String(row.situacaoCodigo ?? ''),
        situacaoDescricao: String(row.situacaoDescricao ?? ''),
        regiaoCodigo: String(row.regiaoCodigo ?? ''),
        regiaoDescricao: String(row.regiaoDescricao ?? ''),
        totalQtd,
        totalPercentual: this.calculatePercentage(totalQtd, totalSituacaoQtd)
      };
    });

    return {
      items
    };
  }

  async getFiliacaoSituacaoRegiaoEsferaDistribuicao(
    situacaoCodigo: string,
    regiaoCodigo: string
  ): Promise<DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoRow>(
      pool
        .request()
        .input('situacaoCodigo', sql.VarChar(20), situacaoCodigo)
        .input('regiaoCodigo', sql.VarChar(20), regiaoCodigo),
      `
        WITH Base AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            CASE
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '1' THEN pr.REGIAO
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '3' THEN gc.REGIAO
              ELSE pr.REGIAO
            END AS regiaoCodigo,
            CASE
              WHEN ISNULL(cfg.ESTADUAL, 0) = 1 THEN 'ESTADO'
              ELSE 'MUNICIPIO'
            END AS esfera
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PREDIO AS pr
            ON pr.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND pr.CODIGO = f.CODIGO_PREDIO
          LEFT JOIN dbo.PESSOAS AS pe
            ON pe.CPF = f.CPF
          LEFT JOIN dbo.GLO_CIDADE AS gc
            ON gc.UF = pe.ESTADO
            AND gc.CIDADE = pe.CIDADE
          LEFT JOIN dbo.SINDATA_CONFIG_PREDIO_ENTE_PUBLICO AS cfg
            ON cfg.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND cfg.CODIGO_PREDIO = f.CODIGO_PREDIO
          WHERE f.ASSOCIADO = -1
        ),
        Filtrado AS (
          SELECT
            b.esfera,
            COUNT_BIG(1) AS totalQtd
          FROM Base AS b
          WHERE
            CAST(b.situacaoCodigo AS VARCHAR(20)) = @situacaoCodigo
            AND CAST(b.regiaoCodigo AS VARCHAR(20)) = @regiaoCodigo
          GROUP BY
            b.esfera
        ),
        Categorias AS (
          SELECT CAST('ESTADO' AS VARCHAR(20)) AS esfera
          UNION ALL
          SELECT CAST('MUNICIPIO' AS VARCHAR(20)) AS esfera
        ),
        Total AS (
          SELECT ISNULL(SUM(f.totalQtd), 0) AS totalGeralQtd
          FROM Filtrado AS f
        )
        SELECT
          c.esfera,
          ISNULL(f.totalQtd, 0) AS totalQtd,
          t.totalGeralQtd
        FROM Categorias AS c
        LEFT JOIN Filtrado AS f
          ON f.esfera = c.esfera
        CROSS JOIN Total AS t
        ORDER BY
          c.esfera ASC
      `
    );

    const items: DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoItem[] = result.recordset.map((row) => {
      const totalQtd = this.parseSqlNumber(row.totalQtd ?? 0);
      const totalGeralQtd = this.parseSqlNumber(row.totalGeralQtd ?? 0);

      return {
        esfera: String(row.esfera ?? ''),
        totalQtd,
        totalPercentual: this.calculatePercentage(totalQtd, totalGeralQtd)
      };
    });

    return { items };
  }

  async getFiliacaoSituacaoRegiaoEsferaSexoDistribuicao(
    situacaoCodigo: string,
    regiaoCodigo: string,
    esfera: string
  ): Promise<DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoRow>(
      pool
        .request()
        .input('situacaoCodigo', sql.VarChar(20), situacaoCodigo)
        .input('regiaoCodigo', sql.VarChar(20), regiaoCodigo)
        .input('esfera', sql.VarChar(20), String(esfera ?? '').trim().toUpperCase()),
      `
        WITH Generos AS (
          SELECT
            g.GENERO AS genero,
            g.DESCRICAO AS descricao
          FROM dbo.GENERO AS g
        ),
        Base AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            CASE
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '1' THEN pr.REGIAO
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '3' THEN gc.REGIAO
              ELSE pr.REGIAO
            END AS regiaoCodigo,
            CASE
              WHEN ISNULL(cfg.ESTADUAL, 0) = 1 THEN 'ESTADO'
              ELSE 'MUNICIPIO'
            END AS esfera,
            p.SEXO AS genero
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PREDIO AS pr
            ON pr.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND pr.CODIGO = f.CODIGO_PREDIO
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          LEFT JOIN dbo.GLO_CIDADE AS gc
            ON gc.UF = p.ESTADO
            AND gc.CIDADE = p.CIDADE
          LEFT JOIN dbo.SINDATA_CONFIG_PREDIO_ENTE_PUBLICO AS cfg
            ON cfg.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND cfg.CODIGO_PREDIO = f.CODIGO_PREDIO
          WHERE f.ASSOCIADO = -1
        ),
        Filtrado AS (
          SELECT
            b.esfera,
            b.genero,
            COUNT_BIG(1) AS totalQtd
          FROM Base AS b
          WHERE
            CAST(b.situacaoCodigo AS VARCHAR(20)) = @situacaoCodigo
            AND CAST(b.regiaoCodigo AS VARCHAR(20)) = @regiaoCodigo
            AND b.esfera = @esfera
          GROUP BY
            b.esfera,
            b.genero
        ),
        Total AS (
          SELECT ISNULL(SUM(f.totalQtd), 0) AS totalEsferaQtd
          FROM Filtrado AS f
        )
        SELECT
          @esfera AS esfera,
          g.genero,
          g.descricao AS generoDescricao,
          ISNULL(f.totalQtd, 0) AS totalQtd,
          t.totalEsferaQtd
        FROM Generos AS g
        LEFT JOIN Filtrado AS f
          ON f.genero = g.genero
        CROSS JOIN Total AS t
        ORDER BY
          g.descricao ASC
      `
    );

    const items: DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoItem[] = result.recordset.map((row) => {
      const totalQtd = this.parseSqlNumber(row.totalQtd ?? 0);
      const totalEsferaQtd = this.parseSqlNumber(row.totalEsferaQtd ?? 0);

      return {
        esfera: String(row.esfera ?? ''),
        genero: String(row.genero ?? ''),
        generoDescricao: String(row.generoDescricao ?? ''),
        totalQtd,
        totalPercentual: this.calculatePercentage(totalQtd, totalEsferaQtd)
      };
    });

    return { items };
  }

  async getFiliacaoSituacaoRegiaoInconsistencias(): Promise<DashboardFiliacaoSituacaoRegiaoInconsistenciasResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoRegiaoInconsistenciaRow>(
      pool.request(),
      `
        WITH Base AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            sf.DESCRICAO AS situacaoDescricao,
            f.CPF AS cpf,
            p.NOME AS nome,
            p.CPF AS pessoaCpf,
            p.ESTADO AS estadoPessoa,
            p.CIDADE AS cidadePessoa,
            pr.CODIGO AS predioCodigo,
            pr.REGIAO AS predioRegiaoCodigo,
            gc.UF AS cidadeMapeadaUf,
            gc.CIDADE AS cidadeMapeadaNome,
            gc.REGIAO AS cidadeRegiaoCodigo,
            CASE
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '1' THEN pr.REGIAO
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '3' THEN gc.REGIAO
              ELSE pr.REGIAO
            END AS regiaoCodigo
          FROM dbo.FILIADO AS f
          INNER JOIN dbo.SITUACAO_FILIADO AS sf
            ON sf.CODIGO = f.SITUACAO
            AND sf.ATIVO = 1
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          LEFT JOIN dbo.PREDIO AS pr
            ON pr.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND pr.CODIGO = f.CODIGO_PREDIO
          LEFT JOIN dbo.GLO_CIDADE AS gc
            ON gc.UF = p.ESTADO
            AND gc.CIDADE = p.CIDADE
          WHERE f.ASSOCIADO = -1
            AND p.CPF IS NOT NULL
        ),
        Classificada AS (
          SELECT
            b.situacaoCodigo,
            b.situacaoDescricao,
            b.cpf,
            b.nome,
            b.regiaoCodigo,
            CASE
              WHEN CAST(b.situacaoCodigo AS VARCHAR(20)) = '1' AND b.predioCodigo IS NULL
                THEN 'Filiação sem vínculo de prédio válido (CÓDIGO_EMPRESA/CÓDIGO_PREDIO).'
              WHEN CAST(b.situacaoCodigo AS VARCHAR(20)) = '1' AND b.predioRegiaoCodigo IS NULL
                THEN 'Prédio vinculado sem região informada.'
              WHEN CAST(b.situacaoCodigo AS VARCHAR(20)) = '3'
                AND (
                  NULLIF(LTRIM(RTRIM(COALESCE(b.estadoPessoa, ''))), '') IS NULL
                  OR NULLIF(LTRIM(RTRIM(COALESCE(b.cidadePessoa, ''))), '') IS NULL
                )
                THEN 'Pessoa sem UF/Cidade preenchidos para mapear região.'
              WHEN CAST(b.situacaoCodigo AS VARCHAR(20)) = '3' AND b.cidadeMapeadaUf IS NULL
                THEN 'UF/Cidade da pessoa não encontrada na GLO_CIDADE.'
              WHEN CAST(b.situacaoCodigo AS VARCHAR(20)) = '3' AND b.cidadeRegiaoCodigo IS NULL
                THEN 'Cidade da pessoa sem região informada na GLO_CIDADE.'
              ELSE NULL
            END AS motivoBase
          FROM Base AS b
        )
        SELECT
          c.situacaoCodigo,
          c.situacaoDescricao,
          c.cpf,
          c.nome,
          CASE
            WHEN c.motivoBase IS NOT NULL THEN c.motivoBase
            WHEN c.regiaoCodigo IS NULL THEN 'Registro sem região válida para mapeamento.'
            WHEN r.CODIGO IS NULL THEN 'Código de região sem correspondência na tabela REGIAO.'
            ELSE 'Inconsistência de região.'
          END AS motivo
        FROM Classificada AS c
        LEFT JOIN dbo.REGIAO AS r
          ON r.CODIGO = c.regiaoCodigo
        WHERE
          c.motivoBase IS NOT NULL
          OR (
            c.regiaoCodigo IS NULL
            OR r.CODIGO IS NULL
          )
        ORDER BY
          c.situacaoDescricao ASC,
          c.nome ASC,
          c.cpf ASC
      `
    );

    const items: DashboardFiliacaoSituacaoRegiaoInconsistenciaItem[] = result.recordset.map((row) => ({
      situacaoCodigo: String(row.situacaoCodigo ?? ''),
      situacaoDescricao: String(row.situacaoDescricao ?? ''),
      cpf: String(row.cpf ?? ''),
      nome: String(row.nome ?? ''),
      motivo: String(row.motivo ?? '')
    }));

    return { items };
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

  async getFiliacaoSituacaoDesfiliadosSexoInconsistencias(): Promise<DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciasResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciaRow>(
      pool.request(),
      `
        WITH Base AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            sf.DESCRICAO AS situacaoDescricao,
            f.CPF AS cpf,
            p.NOME AS nome,
            p.CPF AS pessoaCpf,
            p.SEXO AS sexoPessoa,
            g.GENERO AS generoValido
          FROM dbo.FILIADO AS f
          INNER JOIN dbo.SITUACAO_FILIADO AS sf
            ON sf.CODIGO = f.SITUACAO
            AND sf.ATIVO = 1
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          LEFT JOIN dbo.GENERO AS g
            ON g.GENERO = p.SEXO
          WHERE f.ASSOCIADO = 0
            AND p.CPF IS NOT NULL
        )
        SELECT
          b.situacaoCodigo,
          b.situacaoDescricao,
          b.cpf,
          b.nome,
          CASE
            WHEN NULLIF(LTRIM(RTRIM(COALESCE(b.sexoPessoa, ''))), '') IS NULL THEN 'Pessoa sem sexo informado.'
            WHEN b.generoValido IS NULL THEN 'Sexo da pessoa sem correspondência na tabela GENERO.'
            ELSE 'Inconsistência de sexo.'
          END AS motivo
        FROM Base AS b
        WHERE
          NULLIF(LTRIM(RTRIM(COALESCE(b.sexoPessoa, ''))), '') IS NULL
          OR b.generoValido IS NULL
        ORDER BY
          b.situacaoDescricao ASC,
          b.nome ASC,
          b.cpf ASC
      `
    );

    const items: DashboardFiliacaoSituacaoDesfiliadosSexoInconsistenciaItem[] = result.recordset.map((row) => ({
      situacaoCodigo: String(row.situacaoCodigo ?? ''),
      situacaoDescricao: String(row.situacaoDescricao ?? ''),
      cpf: String(row.cpf ?? ''),
      nome: String(row.nome ?? ''),
      motivo: String(row.motivo ?? '')
    }));

    return { items };
  }

  async getFiliacaoSituacaoDesfiliadosRegiaoDistribuicao(): Promise<DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoRow>(
      pool.request(),
      `
        WITH SituacoesAtivas AS (
          SELECT
            sf.CODIGO AS codigo,
            sf.DESCRICAO AS descricao
          FROM dbo.SITUACAO_FILIADO AS sf
          WHERE sf.ATIVO = 1
        ),
        Regioes AS (
          SELECT
            r.CODIGO AS codigo,
            r.DESCRICAO AS descricao
          FROM dbo.REGIAO AS r
        ),
        DesfiliadosPorSituacaoRegiao AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            CASE
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '1' THEN pr.REGIAO
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '3' THEN gc.REGIAO
              ELSE pr.REGIAO
            END AS regiaoCodigo,
            COUNT_BIG(1) AS totalQtd
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PREDIO AS pr
            ON pr.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND pr.CODIGO = f.CODIGO_PREDIO
          LEFT JOIN dbo.PESSOAS AS pe
            ON pe.CPF = f.CPF
          LEFT JOIN dbo.GLO_CIDADE AS gc
            ON gc.UF = pe.ESTADO
            AND gc.CIDADE = pe.CIDADE
          WHERE f.ASSOCIADO = 0
          GROUP BY
            f.SITUACAO,
            CASE
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '1' THEN pr.REGIAO
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '3' THEN gc.REGIAO
              ELSE pr.REGIAO
            END
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
          r.codigo AS regiaoCodigo,
          r.descricao AS regiaoDescricao,
          ISNULL(dsr.totalQtd, 0) AS totalQtd,
          ISNULL(tds.totalSituacaoQtd, 0) AS totalSituacaoQtd
        FROM SituacoesAtivas AS sa
        CROSS JOIN Regioes AS r
        LEFT JOIN DesfiliadosPorSituacaoRegiao AS dsr
          ON dsr.situacaoCodigo = sa.codigo
          AND dsr.regiaoCodigo = r.codigo
        LEFT JOIN TotaisDesfiliadosPorSituacao AS tds
          ON tds.situacaoCodigo = sa.codigo
        ORDER BY
          sa.descricao ASC,
          r.descricao ASC
      `
    );

    const items: DashboardFiliacaoSituacaoDesfiliadosRegiaoDistribuicaoItem[] = result.recordset.map((row) => {
      const totalQtd = this.parseSqlNumber(row.totalQtd ?? 0);
      const totalSituacaoQtd = this.parseSqlNumber(row.totalSituacaoQtd ?? 0);

      return {
        situacaoCodigo: String(row.situacaoCodigo ?? ''),
        situacaoDescricao: String(row.situacaoDescricao ?? ''),
        regiaoCodigo: String(row.regiaoCodigo ?? ''),
        regiaoDescricao: String(row.regiaoDescricao ?? ''),
        totalQtd,
        totalPercentual: this.calculatePercentage(totalQtd, totalSituacaoQtd)
      };
    });

    return {
      items
    };
  }

  async getFiliacaoSituacaoDesfiliadosRegiaoEsferaDistribuicao(
    situacaoCodigo: string,
    regiaoCodigo: string
  ): Promise<DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoRow>(
      pool
        .request()
        .input('situacaoCodigo', sql.VarChar(20), situacaoCodigo)
        .input('regiaoCodigo', sql.VarChar(20), regiaoCodigo),
      `
        WITH Base AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            CASE
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '1' THEN pr.REGIAO
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '3' THEN gc.REGIAO
              ELSE pr.REGIAO
            END AS regiaoCodigo,
            CASE
              WHEN ISNULL(cfg.ESTADUAL, 0) = 1 THEN 'ESTADO'
              ELSE 'MUNICIPIO'
            END AS esfera
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PREDIO AS pr
            ON pr.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND pr.CODIGO = f.CODIGO_PREDIO
          LEFT JOIN dbo.PESSOAS AS pe
            ON pe.CPF = f.CPF
          LEFT JOIN dbo.GLO_CIDADE AS gc
            ON gc.UF = pe.ESTADO
            AND gc.CIDADE = pe.CIDADE
          LEFT JOIN dbo.SINDATA_CONFIG_PREDIO_ENTE_PUBLICO AS cfg
            ON cfg.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND cfg.CODIGO_PREDIO = f.CODIGO_PREDIO
          WHERE f.ASSOCIADO = 0
        ),
        Filtrado AS (
          SELECT
            b.esfera,
            COUNT_BIG(1) AS totalQtd
          FROM Base AS b
          WHERE
            CAST(b.situacaoCodigo AS VARCHAR(20)) = @situacaoCodigo
            AND CAST(b.regiaoCodigo AS VARCHAR(20)) = @regiaoCodigo
          GROUP BY
            b.esfera
        ),
        Categorias AS (
          SELECT CAST('ESTADO' AS VARCHAR(20)) AS esfera
          UNION ALL
          SELECT CAST('MUNICIPIO' AS VARCHAR(20)) AS esfera
        ),
        Total AS (
          SELECT ISNULL(SUM(f.totalQtd), 0) AS totalGeralQtd
          FROM Filtrado AS f
        )
        SELECT
          c.esfera,
          ISNULL(f.totalQtd, 0) AS totalQtd,
          t.totalGeralQtd
        FROM Categorias AS c
        LEFT JOIN Filtrado AS f
          ON f.esfera = c.esfera
        CROSS JOIN Total AS t
        ORDER BY
          c.esfera ASC
      `
    );

    const items: DashboardFiliacaoSituacaoRegiaoEsferaDistribuicaoItem[] = result.recordset.map((row) => {
      const totalQtd = this.parseSqlNumber(row.totalQtd ?? 0);
      const totalGeralQtd = this.parseSqlNumber(row.totalGeralQtd ?? 0);

      return {
        esfera: String(row.esfera ?? ''),
        totalQtd,
        totalPercentual: this.calculatePercentage(totalQtd, totalGeralQtd)
      };
    });

    return { items };
  }

  async getFiliacaoSituacaoDesfiliadosRegiaoEsferaSexoDistribuicao(
    situacaoCodigo: string,
    regiaoCodigo: string,
    esfera: string
  ): Promise<DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoRow>(
      pool
        .request()
        .input('situacaoCodigo', sql.VarChar(20), situacaoCodigo)
        .input('regiaoCodigo', sql.VarChar(20), regiaoCodigo)
        .input('esfera', sql.VarChar(20), String(esfera ?? '').trim().toUpperCase()),
      `
        WITH Generos AS (
          SELECT
            g.GENERO AS genero,
            g.DESCRICAO AS descricao
          FROM dbo.GENERO AS g
        ),
        Base AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            CASE
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '1' THEN pr.REGIAO
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '3' THEN gc.REGIAO
              ELSE pr.REGIAO
            END AS regiaoCodigo,
            CASE
              WHEN ISNULL(cfg.ESTADUAL, 0) = 1 THEN 'ESTADO'
              ELSE 'MUNICIPIO'
            END AS esfera,
            p.SEXO AS genero
          FROM dbo.FILIADO AS f
          LEFT JOIN dbo.PREDIO AS pr
            ON pr.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND pr.CODIGO = f.CODIGO_PREDIO
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          LEFT JOIN dbo.GLO_CIDADE AS gc
            ON gc.UF = p.ESTADO
            AND gc.CIDADE = p.CIDADE
          LEFT JOIN dbo.SINDATA_CONFIG_PREDIO_ENTE_PUBLICO AS cfg
            ON cfg.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND cfg.CODIGO_PREDIO = f.CODIGO_PREDIO
          WHERE f.ASSOCIADO = 0
        ),
        Filtrado AS (
          SELECT
            b.esfera,
            b.genero,
            COUNT_BIG(1) AS totalQtd
          FROM Base AS b
          WHERE
            CAST(b.situacaoCodigo AS VARCHAR(20)) = @situacaoCodigo
            AND CAST(b.regiaoCodigo AS VARCHAR(20)) = @regiaoCodigo
            AND b.esfera = @esfera
          GROUP BY
            b.esfera,
            b.genero
        ),
        Total AS (
          SELECT ISNULL(SUM(f.totalQtd), 0) AS totalEsferaQtd
          FROM Filtrado AS f
        )
        SELECT
          @esfera AS esfera,
          g.genero,
          g.descricao AS generoDescricao,
          ISNULL(f.totalQtd, 0) AS totalQtd,
          t.totalEsferaQtd
        FROM Generos AS g
        LEFT JOIN Filtrado AS f
          ON f.genero = g.genero
        CROSS JOIN Total AS t
        ORDER BY
          g.descricao ASC
      `
    );

    const items: DashboardFiliacaoSituacaoRegiaoEsferaSexoDistribuicaoItem[] = result.recordset.map((row) => {
      const totalQtd = this.parseSqlNumber(row.totalQtd ?? 0);
      const totalEsferaQtd = this.parseSqlNumber(row.totalEsferaQtd ?? 0);

      return {
        esfera: String(row.esfera ?? ''),
        genero: String(row.genero ?? ''),
        generoDescricao: String(row.generoDescricao ?? ''),
        totalQtd,
        totalPercentual: this.calculatePercentage(totalQtd, totalEsferaQtd)
      };
    });

    return { items };
  }

  async getFiliacaoSituacaoDesfiliadosRegiaoInconsistencias(): Promise<DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciasResponse> {
    const pool = await getSqlPool();
    const result = await queryReadOnly<DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaRow>(
      pool.request(),
      `
        WITH Base AS (
          SELECT
            f.SITUACAO AS situacaoCodigo,
            sf.DESCRICAO AS situacaoDescricao,
            f.CPF AS cpf,
            p.NOME AS nome,
            p.CPF AS pessoaCpf,
            p.ESTADO AS estadoPessoa,
            p.CIDADE AS cidadePessoa,
            pr.CODIGO AS predioCodigo,
            pr.REGIAO AS predioRegiaoCodigo,
            gc.UF AS cidadeMapeadaUf,
            gc.CIDADE AS cidadeMapeadaNome,
            gc.REGIAO AS cidadeRegiaoCodigo,
            CASE
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '1' THEN pr.REGIAO
              WHEN CAST(f.SITUACAO AS VARCHAR(20)) = '3' THEN gc.REGIAO
              ELSE pr.REGIAO
            END AS regiaoCodigo
          FROM dbo.FILIADO AS f
          INNER JOIN dbo.SITUACAO_FILIADO AS sf
            ON sf.CODIGO = f.SITUACAO
            AND sf.ATIVO = 1
          LEFT JOIN dbo.PESSOAS AS p
            ON p.CPF = f.CPF
          LEFT JOIN dbo.PREDIO AS pr
            ON pr.CODIGO_EMPRESA = f.CODIGO_EMPRESA
            AND pr.CODIGO = f.CODIGO_PREDIO
          LEFT JOIN dbo.GLO_CIDADE AS gc
            ON gc.UF = p.ESTADO
            AND gc.CIDADE = p.CIDADE
          WHERE f.ASSOCIADO = 0
            AND p.CPF IS NOT NULL
        ),
        Classificada AS (
          SELECT
            b.situacaoCodigo,
            b.situacaoDescricao,
            b.cpf,
            b.nome,
            b.regiaoCodigo,
            CASE
              WHEN CAST(b.situacaoCodigo AS VARCHAR(20)) = '1' AND b.predioCodigo IS NULL
                THEN 'Filiação sem vínculo de prédio válido (CÓDIGO_EMPRESA/CÓDIGO_PREDIO).'
              WHEN CAST(b.situacaoCodigo AS VARCHAR(20)) = '1' AND b.predioRegiaoCodigo IS NULL
                THEN 'Prédio vinculado sem região informada.'
              WHEN CAST(b.situacaoCodigo AS VARCHAR(20)) = '3'
                AND (
                  NULLIF(LTRIM(RTRIM(COALESCE(b.estadoPessoa, ''))), '') IS NULL
                  OR NULLIF(LTRIM(RTRIM(COALESCE(b.cidadePessoa, ''))), '') IS NULL
                )
                THEN 'Pessoa sem UF/Cidade preenchidos para mapear região.'
              WHEN CAST(b.situacaoCodigo AS VARCHAR(20)) = '3' AND b.cidadeMapeadaUf IS NULL
                THEN 'UF/Cidade da pessoa não encontrada na GLO_CIDADE.'
              WHEN CAST(b.situacaoCodigo AS VARCHAR(20)) = '3' AND b.cidadeRegiaoCodigo IS NULL
                THEN 'Cidade da pessoa sem região informada na GLO_CIDADE.'
              ELSE NULL
            END AS motivoBase
          FROM Base AS b
        )
        SELECT
          c.situacaoCodigo,
          c.situacaoDescricao,
          c.cpf,
          c.nome,
          CASE
            WHEN c.motivoBase IS NOT NULL THEN c.motivoBase
            WHEN c.regiaoCodigo IS NULL THEN 'Registro sem região válida para mapeamento.'
            WHEN r.CODIGO IS NULL THEN 'Código de região sem correspondência na tabela REGIAO.'
            ELSE 'Inconsistência de região.'
          END AS motivo
        FROM Classificada AS c
        LEFT JOIN dbo.REGIAO AS r
          ON r.CODIGO = c.regiaoCodigo
        WHERE
          c.motivoBase IS NOT NULL
          OR (
          c.regiaoCodigo IS NULL
          OR r.CODIGO IS NULL
        )
        ORDER BY
          c.situacaoDescricao ASC,
          c.nome ASC,
          c.cpf ASC
      `
    );

    const items: DashboardFiliacaoSituacaoDesfiliadosRegiaoInconsistenciaItem[] = result.recordset.map((row) => ({
      situacaoCodigo: String(row.situacaoCodigo ?? ''),
      situacaoDescricao: String(row.situacaoDescricao ?? ''),
      cpf: String(row.cpf ?? ''),
      nome: String(row.nome ?? ''),
      motivo: String(row.motivo ?? '')
    }));

    return { items };
  }
}
