import { getSqlPool } from '../../database/sqlserver';
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
