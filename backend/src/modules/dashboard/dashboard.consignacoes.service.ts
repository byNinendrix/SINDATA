import { getSqlPool, sql } from '../../database/sqlserver';
import { queryReadOnly } from '../../database/readOnlyGuard';
import type {
  ConsignacaoFilters,
  ConsignacaoInconsistenciasResponse,
  ConsignacaoPorEntePublicoResponse,
  ConsignacaoPorPeriodoResponse,
  ConsignacaoPorRegiaoResponse,
  ConsignacaoPorSituacaoResponse,
  ConsignacaoResumoResponse
} from './dashboard.consignacoes.types';

interface ConsignacaoResumoRow {
  totalContribuido: number | string;
  quantidadeRegistros: number | string;
  quantidadeContribuintes: number | string;
  anoInicial: number | string | null;
  anoFinal: number | string | null;
}

interface ConsignacaoPeriodoRow {
  ano: number | string;
  mes: number | string;
  valorTotal: number | string;
  quantidadeRegistros: number | string;
  quantidadeContribuintes: number | string;
}

interface ConsignacaoRegiaoRow {
  regiaoCodigo: string | null;
  regiaoDescricao: string | null;
  valorTotal: number | string;
  quantidadeRegistros: number | string;
  quantidadeContribuintes: number | string;
}

interface ConsignacaoSituacaoRow {
  situacaoCodigo: string | null;
  situacaoDescricao: string | null;
  valorTotal: number | string;
  quantidadeRegistros: number | string;
  quantidadeContribuintes: number | string;
}

interface ConsignacaoEnteRow {
  codigoEmpresa: string | null;
  enteDescricao: string | null;
  valorTotal: number | string;
  quantidadeRegistros: number | string;
  quantidadeContribuintes: number | string;
}

interface ConsignacaoInconsistenciaRow {
  sequencial: number | string;
  codigoEmpresa: string | null;
  enteDescricao: string | null;
  codigoPredio: string | null;
  descricaoPredio: string | null;
  matricula: string | null;
  cpf: string | null;
  nome: string | null;
  situacaoCodigo: string | null;
  situacaoDescricao: string | null;
  regiaoCodigo: string | null;
  regiaoDescricao: string | null;
  motivo: string | null;
}

interface ParsedPeriodo {
  value: number;
}

export class DashboardConsignacoesService {
  private parseSqlNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }
    const normalized = Number(String(value).replace(',', '.'));
    return Number.isFinite(normalized) ? normalized : 0;
  }

  private parseInteger(value: number | string | null | undefined): number {
    return Math.trunc(this.parseSqlNumber(value));
  }

  private toNullableInteger(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    return this.parseInteger(value);
  }

  private normalizeFilters(filters: ConsignacaoFilters): ConsignacaoFilters {
    const normalized: ConsignacaoFilters = {};

    if (typeof filters.ano === 'number' && Number.isInteger(filters.ano) && filters.ano >= 1900 && filters.ano <= 2999) {
      normalized.ano = filters.ano;
    }

    if (typeof filters.mes === 'number' && Number.isInteger(filters.mes) && filters.mes >= 1 && filters.mes <= 12) {
      normalized.mes = filters.mes;
    }

    if (filters.regiao) {
      normalized.regiao = String(filters.regiao).trim().toUpperCase().slice(0, 10);
    }

    if (filters.situacao) {
      normalized.situacao = String(filters.situacao).trim().toUpperCase().slice(0, 10);
    }

    if (filters.codigoEmpresa) {
      normalized.codigoEmpresa = String(filters.codigoEmpresa).trim().toUpperCase().slice(0, 20);
    }

    if (filters.periodoInicio) {
      normalized.periodoInicio = String(filters.periodoInicio).trim();
    }

    if (filters.periodoFim) {
      normalized.periodoFim = String(filters.periodoFim).trim();
    }

    return normalized;
  }

  private parsePeriodo(value?: string): ParsedPeriodo | null {
    if (!value) {
      return null;
    }

    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    const ano = Number.parseInt(match[1], 10);
    const mes = Number.parseInt(match[2], 10);
    if (!Number.isInteger(ano) || !Number.isInteger(mes) || ano < 1900 || ano > 2999 || mes < 1 || mes > 12) {
      return null;
    }

    return {
      value: ano * 100 + mes
    };
  }

  private buildConsignacaoWhereClause(request: sql.Request, filters: ConsignacaoFilters, alias = 'c'): string {
    const whereParts: string[] = [];

    if (filters.ano !== undefined) {
      request.input('f_ano', sql.Int, filters.ano);
      whereParts.push(`${alias}.ANOCOMPETENCIA = @f_ano`);
    }

    if (filters.mes !== undefined) {
      request.input('f_mes', sql.Int, filters.mes);
      whereParts.push(`${alias}.MESCOMPETENCIA = @f_mes`);
    }

    if (filters.regiao) {
      request.input('f_regiao', sql.VarChar(10), filters.regiao);
      whereParts.push(`${alias}.REGIAO = @f_regiao`);
    }

    if (filters.situacao) {
      request.input('f_situacao', sql.VarChar(10), filters.situacao);
      whereParts.push(`${alias}.SITUACAO = @f_situacao`);
    }

    if (filters.codigoEmpresa) {
      request.input('f_codigo_empresa', sql.VarChar(20), filters.codigoEmpresa);
      whereParts.push(`${alias}.CODIGO_EMPRESA = @f_codigo_empresa`);
    }

    const inicio = this.parsePeriodo(filters.periodoInicio);
    if (inicio) {
      request.input('f_periodo_inicio', sql.Int, inicio.value);
      whereParts.push(`(${alias}.ANOCOMPETENCIA * 100 + ${alias}.MESCOMPETENCIA) >= @f_periodo_inicio`);
    }

    const fim = this.parsePeriodo(filters.periodoFim);
    if (fim) {
      request.input('f_periodo_fim', sql.Int, fim.value);
      whereParts.push(`(${alias}.ANOCOMPETENCIA * 100 + ${alias}.MESCOMPETENCIA) <= @f_periodo_fim`);
    }

    if (whereParts.length === 0) {
      return '';
    }

    return `WHERE ${whereParts.join(' AND ')}`;
  }

  async getResumo(rawFilters: ConsignacaoFilters): Promise<ConsignacaoResumoResponse> {
    const filters = this.normalizeFilters(rawFilters);
    const pool = await getSqlPool();

    const resumoRequest = pool.request();
    const resumoWhereClause = this.buildConsignacaoWhereClause(resumoRequest, filters, 'c');

    const resumoResult = await queryReadOnly<ConsignacaoResumoRow>(
      resumoRequest,
      `
        WITH Base AS (
          SELECT
            c.CPF,
            c.ANOCOMPETENCIA AS ano,
            c.MESCOMPETENCIA AS mes,
            CAST(ISNULL(c.VALOR, 0) AS DECIMAL(18, 2)) AS valor
          FROM dbo.CONSIGNACAO AS c
          ${resumoWhereClause}
        )
        SELECT
          CAST(ISNULL(SUM(Base.valor), 0) AS DECIMAL(18, 2)) AS totalContribuido,
          COUNT_BIG(1) AS quantidadeRegistros,
          COUNT(DISTINCT NULLIF(LTRIM(RTRIM(ISNULL(Base.CPF, ''))), '')) AS quantidadeContribuintes,
          MIN(Base.ano) AS anoInicial,
          MAX(Base.ano) AS anoFinal
        FROM Base
      `
    );

    const periodosRequest = pool.request();
    const periodosWhereClause = this.buildConsignacaoWhereClause(periodosRequest, filters, 'c');
    const periodosResult = await queryReadOnly<ConsignacaoPeriodoRow>(
      periodosRequest,
      `
        WITH Base AS (
          SELECT
            c.CPF,
            c.ANOCOMPETENCIA AS ano,
            c.MESCOMPETENCIA AS mes,
            CAST(ISNULL(c.VALOR, 0) AS DECIMAL(18, 2)) AS valor
          FROM dbo.CONSIGNACAO AS c
          ${periodosWhereClause}
        )
        SELECT
          Base.ano,
          Base.mes,
          CAST(SUM(Base.valor) AS DECIMAL(18, 2)) AS valorTotal,
          COUNT_BIG(1) AS quantidadeRegistros,
          COUNT(DISTINCT NULLIF(LTRIM(RTRIM(ISNULL(Base.CPF, ''))), '')) AS quantidadeContribuintes
        FROM Base
        GROUP BY
          Base.ano,
          Base.mes
        ORDER BY
          Base.ano ASC,
          Base.mes ASC
      `
    );

    const resumo = resumoResult.recordset[0];
    const totalContribuido = this.parseSqlNumber(resumo?.totalContribuido ?? 0);
    const quantidadeRegistros = this.parseInteger(resumo?.quantidadeRegistros ?? 0);
    const quantidadeContribuintes = this.parseInteger(resumo?.quantidadeContribuintes ?? 0);
    const anoInicial = this.toNullableInteger(resumo?.anoInicial);
    const anoFinal = this.toNullableInteger(resumo?.anoFinal);

    const periodos = periodosResult.recordset.map((row) => ({
      ano: this.parseInteger(row.ano),
      mes: this.parseInteger(row.mes),
      valorTotal: this.parseSqlNumber(row.valorTotal),
      quantidadeRegistros: this.parseInteger(row.quantidadeRegistros),
      quantidadeContribuintes: this.parseInteger(row.quantidadeContribuintes)
    }));

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const anosDisponiveis = Array.from(new Set(periodos.map((item) => item.ano))).sort((a, b) => a - b);
    const ultimoAnoDisponivel = anosDisponiveis.length > 0 ? anosDisponiveis[anosDisponiveis.length - 1] : null;
    const anoReferencia =
      filters.ano ??
      (anosDisponiveis.includes(anoAtual) ? anoAtual : ultimoAnoDisponivel);

    const periodosAnoReferencia = periodos
      .filter((item) => item.ano === anoReferencia)
      .sort((a, b) => a.mes - b.mes);
    const mesesAnoReferencia = periodosAnoReferencia.map((item) => item.mes);
    const ultimoMesDisponivel = mesesAnoReferencia.length > 0 ? mesesAnoReferencia[mesesAnoReferencia.length - 1] : null;
    const mesReferencia =
      filters.mes ??
      (mesesAnoReferencia.includes(mesAtual) ? mesAtual : ultimoMesDisponivel);

    const totalAnoAtual = periodos
      .filter((item) => item.ano === anoReferencia)
      .reduce((acc, item) => acc + item.valorTotal, 0);

    const totalMesAtual = periodos
      .filter((item) => item.ano === anoReferencia && item.mes === mesReferencia)
      .reduce((acc, item) => acc + item.valorTotal, 0);

    const mediaMensal =
      periodos.length > 0
        ? periodos.reduce((acc, item) => acc + item.valorTotal, 0) / periodos.length
        : 0;

    return {
      totalContribuido,
      totalAnoAtual,
      totalMesAtual,
      mediaMensal,
      quantidadeRegistros,
      quantidadeContribuintes,
      periodo: {
        anoInicial,
        anoFinal,
        ultimoAnoDisponivel,
        ultimoMesDisponivel,
        anoReferencia: anoReferencia ?? null,
        mesReferencia: mesReferencia ?? null
      }
    };
  }

  async getPorRegiao(rawFilters: ConsignacaoFilters): Promise<ConsignacaoPorRegiaoResponse> {
    const filters = this.normalizeFilters(rawFilters);
    const pool = await getSqlPool();
    const request = pool.request();
    const whereClause = this.buildConsignacaoWhereClause(request, filters, 'c');

    const result = await queryReadOnly<ConsignacaoRegiaoRow>(
      request,
      `
        WITH Base AS (
          SELECT
            ISNULL(NULLIF(LTRIM(RTRIM(c.REGIAO)), ''), '__SEM_REGIAO__') AS regiaoCodigoNormalizada,
            c.CPF,
            CAST(ISNULL(c.VALOR, 0) AS DECIMAL(18, 2)) AS valor
          FROM dbo.CONSIGNACAO AS c
          ${whereClause}
        ),
        Agregado AS (
          SELECT
            b.regiaoCodigoNormalizada AS regiaoCodigo,
            ISNULL(r.DESCRICAO, 'Sem região') AS regiaoDescricao,
            CAST(SUM(b.valor) AS DECIMAL(18, 2)) AS valorTotal,
            COUNT_BIG(1) AS quantidadeRegistros,
            COUNT(DISTINCT NULLIF(LTRIM(RTRIM(ISNULL(b.CPF, ''))), '')) AS quantidadeContribuintes
          FROM Base AS b
          LEFT JOIN dbo.REGIAO AS r
            ON r.CODIGO = b.regiaoCodigoNormalizada
          GROUP BY
            b.regiaoCodigoNormalizada,
            r.DESCRICAO
        )
        SELECT
          Agregado.regiaoCodigo,
          Agregado.regiaoDescricao,
          Agregado.valorTotal,
          Agregado.quantidadeRegistros,
          Agregado.quantidadeContribuintes
        FROM Agregado
        ORDER BY
          Agregado.valorTotal DESC,
          Agregado.regiaoDescricao ASC
      `
    );

    const totalGeral = result.recordset.reduce((acc, row) => acc + this.parseSqlNumber(row.valorTotal), 0);
    const items = result.recordset.map((row) => {
      const valorTotal = this.parseSqlNumber(row.valorTotal);
      return {
        regiaoCodigo: String(row.regiaoCodigo ?? ''),
        regiaoDescricao: String(row.regiaoDescricao ?? 'Sem região'),
        valorTotal,
        percentual: totalGeral > 0 ? Number(((valorTotal / totalGeral) * 100).toFixed(2)) : 0,
        quantidadeRegistros: this.parseInteger(row.quantidadeRegistros),
        quantidadeContribuintes: this.parseInteger(row.quantidadeContribuintes)
      };
    });

    return { items };
  }

  async getPorPeriodo(rawFilters: ConsignacaoFilters): Promise<ConsignacaoPorPeriodoResponse> {
    const filters = this.normalizeFilters(rawFilters);
    const pool = await getSqlPool();
    const request = pool.request();
    const whereClause = this.buildConsignacaoWhereClause(request, filters, 'c');

    const result = await queryReadOnly<ConsignacaoPeriodoRow>(
      request,
      `
        WITH Base AS (
          SELECT
            c.CPF,
            c.ANOCOMPETENCIA AS ano,
            c.MESCOMPETENCIA AS mes,
            CAST(ISNULL(c.VALOR, 0) AS DECIMAL(18, 2)) AS valor
          FROM dbo.CONSIGNACAO AS c
          ${whereClause}
        ),
        Agregado AS (
          SELECT
            b.ano,
            b.mes,
            CAST(SUM(b.valor) AS DECIMAL(18, 2)) AS valorTotal,
            COUNT_BIG(1) AS quantidadeRegistros,
            COUNT(DISTINCT NULLIF(LTRIM(RTRIM(ISNULL(b.CPF, ''))), '')) AS quantidadeContribuintes
          FROM Base AS b
          GROUP BY
            b.ano,
            b.mes
        )
        SELECT
          a.ano,
          a.mes,
          a.valorTotal,
          a.quantidadeRegistros,
          a.quantidadeContribuintes
        FROM Agregado AS a
        ORDER BY
          a.ano DESC,
          a.mes DESC
      `
    );

    const totalsByYear = new Map<number, number>();
    result.recordset.forEach((row) => {
      const ano = this.parseInteger(row.ano);
      const valor = this.parseSqlNumber(row.valorTotal);
      totalsByYear.set(ano, (totalsByYear.get(ano) ?? 0) + valor);
    });

    const items = result.recordset.map((row) => {
      const ano = this.parseInteger(row.ano);
      const valorTotal = this.parseSqlNumber(row.valorTotal);
      const totalAno = totalsByYear.get(ano) ?? 0;
      return {
        ano,
        mes: this.parseInteger(row.mes),
        valorTotal,
        percentualAno: totalAno > 0 ? Number(((valorTotal / totalAno) * 100).toFixed(2)) : 0,
        quantidadeRegistros: this.parseInteger(row.quantidadeRegistros),
        quantidadeContribuintes: this.parseInteger(row.quantidadeContribuintes)
      };
    });

    return { items };
  }

  async getPorSituacao(rawFilters: ConsignacaoFilters): Promise<ConsignacaoPorSituacaoResponse> {
    const filters = this.normalizeFilters(rawFilters);
    const pool = await getSqlPool();
    const request = pool.request();
    const whereClause = this.buildConsignacaoWhereClause(request, filters, 'c');

    const result = await queryReadOnly<ConsignacaoSituacaoRow>(
      request,
      `
        WITH Base AS (
          SELECT
            ISNULL(NULLIF(LTRIM(RTRIM(c.SITUACAO)), ''), '__SEM_SITUACAO__') AS situacaoCodigoNormalizada,
            c.CPF,
            CAST(ISNULL(c.VALOR, 0) AS DECIMAL(18, 2)) AS valor
          FROM dbo.CONSIGNACAO AS c
          ${whereClause}
        ),
        Agregado AS (
          SELECT
            b.situacaoCodigoNormalizada AS situacaoCodigo,
            ISNULL(sf.DESCRICAO, 'Sem situação') AS situacaoDescricao,
            CAST(SUM(b.valor) AS DECIMAL(18, 2)) AS valorTotal,
            COUNT_BIG(1) AS quantidadeRegistros,
            COUNT(DISTINCT NULLIF(LTRIM(RTRIM(ISNULL(b.CPF, ''))), '')) AS quantidadeContribuintes
          FROM Base AS b
          LEFT JOIN dbo.SITUACAO_FILIADO AS sf
            ON sf.CODIGO = b.situacaoCodigoNormalizada
          GROUP BY
            b.situacaoCodigoNormalizada,
            sf.DESCRICAO
        )
        SELECT
          Agregado.situacaoCodigo,
          Agregado.situacaoDescricao,
          Agregado.valorTotal,
          Agregado.quantidadeRegistros,
          Agregado.quantidadeContribuintes
        FROM Agregado
        ORDER BY
          Agregado.valorTotal DESC,
          Agregado.situacaoDescricao ASC
      `
    );

    const totalGeral = result.recordset.reduce((acc, row) => acc + this.parseSqlNumber(row.valorTotal), 0);
    const items = result.recordset.map((row) => {
      const valorTotal = this.parseSqlNumber(row.valorTotal);
      return {
        situacaoCodigo: String(row.situacaoCodigo ?? ''),
        situacaoDescricao: String(row.situacaoDescricao ?? 'Sem situação'),
        valorTotal,
        percentual: totalGeral > 0 ? Number(((valorTotal / totalGeral) * 100).toFixed(2)) : 0,
        quantidadeRegistros: this.parseInteger(row.quantidadeRegistros),
        quantidadeContribuintes: this.parseInteger(row.quantidadeContribuintes)
      };
    });

    return { items };
  }

  async getPorEntePublico(rawFilters: ConsignacaoFilters): Promise<ConsignacaoPorEntePublicoResponse> {
    const filters = this.normalizeFilters(rawFilters);
    const pool = await getSqlPool();
    const request = pool.request();
    const whereClause = this.buildConsignacaoWhereClause(request, filters, 'c');

    const result = await queryReadOnly<ConsignacaoEnteRow>(
      request,
      `
        WITH Base AS (
          SELECT
            c.CODIGO_EMPRESA,
            c.CPF,
            CAST(ISNULL(c.VALOR, 0) AS DECIMAL(18, 2)) AS valor
          FROM dbo.CONSIGNACAO AS c
          ${whereClause}
        ),
        Agregado AS (
          SELECT
            ISNULL(NULLIF(LTRIM(RTRIM(b.CODIGO_EMPRESA)), ''), '__SEM_EMPRESA__') AS codigoEmpresa,
            ISNULL(e.DESCRICAO, 'Ente não identificado') AS enteDescricao,
            CAST(SUM(b.valor) AS DECIMAL(18, 2)) AS valorTotal,
            COUNT_BIG(1) AS quantidadeRegistros,
            COUNT(DISTINCT NULLIF(LTRIM(RTRIM(ISNULL(b.CPF, ''))), '')) AS quantidadeContribuintes
          FROM Base AS b
          LEFT JOIN dbo.EMPRESA AS e
            ON e.CODIGO = b.CODIGO_EMPRESA
          GROUP BY
            b.CODIGO_EMPRESA,
            e.DESCRICAO
        )
        SELECT
          Agregado.codigoEmpresa,
          Agregado.enteDescricao,
          Agregado.valorTotal,
          Agregado.quantidadeRegistros,
          Agregado.quantidadeContribuintes
        FROM Agregado
        ORDER BY
          Agregado.valorTotal DESC,
          Agregado.enteDescricao ASC
      `
    );

    const totalGeral = result.recordset.reduce((acc, row) => acc + this.parseSqlNumber(row.valorTotal), 0);
    const items = result.recordset.map((row) => {
      const valorTotal = this.parseSqlNumber(row.valorTotal);
      return {
        codigoEmpresa: String(row.codigoEmpresa ?? ''),
        enteDescricao: String(row.enteDescricao ?? 'Ente não identificado'),
        valorTotal,
        percentual: totalGeral > 0 ? Number(((valorTotal / totalGeral) * 100).toFixed(2)) : 0,
        quantidadeRegistros: this.parseInteger(row.quantidadeRegistros),
        quantidadeContribuintes: this.parseInteger(row.quantidadeContribuintes)
      };
    });

    return { items };
  }

  async getInconsistencias(rawFilters: ConsignacaoFilters): Promise<ConsignacaoInconsistenciasResponse> {
    const filters = this.normalizeFilters(rawFilters);
    const pool = await getSqlPool();
    const request = pool.request();

    const whereParts: string[] = [];

    if (filters.codigoEmpresa) {
      request.input('f_codigo_empresa', sql.VarChar(20), filters.codigoEmpresa);
      whereParts.push('cr.CODIGO_EMPRESA = @f_codigo_empresa');
    }

    if (filters.situacao) {
      request.input('f_situacao', sql.VarChar(10), filters.situacao);
      whereParts.push('f.SITUACAO = @f_situacao');
    }

    if (filters.regiao) {
      request.input('f_regiao', sql.VarChar(10), filters.regiao);
      whereParts.push('pr.REGIAO = @f_regiao');
    }

    if (filters.ano !== undefined) {
      request.input('f_ano', sql.Int, filters.ano);
      whereParts.push('cp.ANO = @f_ano');
    }

    if (filters.mes !== undefined) {
      request.input('f_mes', sql.Int, filters.mes);
      whereParts.push('cp.MES = @f_mes');
    }

    const inicio = this.parsePeriodo(filters.periodoInicio);
    if (inicio) {
      request.input('f_periodo_inicio', sql.Int, inicio.value);
      whereParts.push('(cp.ANO * 100 + cp.MES) >= @f_periodo_inicio');
    }

    const fim = this.parsePeriodo(filters.periodoFim);
    if (fim) {
      request.input('f_periodo_fim', sql.Int, fim.value);
      whereParts.push('(cp.ANO * 100 + cp.MES) <= @f_periodo_fim');
    }

    const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

    const result = await queryReadOnly<ConsignacaoInconsistenciaRow>(
      request,
      `
        SELECT
          cr.SEQUENCIAL AS sequencial,
          cr.CODIGO_EMPRESA AS codigoEmpresa,
          ISNULL(emp.DESCRICAO, 'Ente não identificado') AS enteDescricao,
          cr.CODIGO_PREDIO AS codigoPredio,
          ISNULL(pr.DESCRICAO, 'Prédio não identificado') AS descricaoPredio,
          cr.MATRICULA AS matricula,
          cr.CPF AS cpf,
          ISNULL(p.NOME, 'Pessoa não identificada') AS nome,
          ISNULL(f.SITUACAO, '') AS situacaoCodigo,
          ISNULL(sf.DESCRICAO, 'Situação não identificada') AS situacaoDescricao,
          ISNULL(pr.REGIAO, '') AS regiaoCodigo,
          ISNULL(r.DESCRICAO, 'Região não identificada') AS regiaoDescricao,
          CASE
            WHEN p.CPF IS NULL THEN 'CPF não encontrado em PESSOAS.'
            WHEN f.CPF IS NULL THEN 'Vínculo não encontrado em FILIADO para CPF/empresa/matrícula/prédio.'
            WHEN pr.CODIGO IS NULL THEN 'Prédio não encontrado para empresa/prédio.'
            WHEN emp.CODIGO IS NULL THEN 'Ente público não encontrado para código da empresa.'
            ELSE 'Inconsistência de repasse.'
          END AS motivo
        FROM dbo.CONSIGNACAO_REPASSE_CRITICA AS cr
        LEFT JOIN dbo.CONSIGNACAO_CAPA AS cp
          ON cp.GUID = cr.GUID
          AND cp.CODIGO_EMPRESA = cr.CODIGO_EMPRESA
        LEFT JOIN dbo.PESSOAS AS p
          ON p.CPF = cr.CPF
        LEFT JOIN dbo.FILIADO AS f
          ON f.CPF = cr.CPF
          AND f.CODIGO_EMPRESA = cr.CODIGO_EMPRESA
          AND f.MATRICULA = cr.MATRICULA
          AND f.CODIGO_PREDIO = cr.CODIGO_PREDIO
        LEFT JOIN dbo.SITUACAO_FILIADO AS sf
          ON sf.CODIGO = f.SITUACAO
        LEFT JOIN dbo.PREDIO AS pr
          ON pr.CODIGO_EMPRESA = cr.CODIGO_EMPRESA
          AND pr.CODIGO = cr.CODIGO_PREDIO
        LEFT JOIN dbo.REGIAO AS r
          ON r.CODIGO = pr.REGIAO
        LEFT JOIN dbo.EMPRESA AS emp
          ON emp.CODIGO = cr.CODIGO_EMPRESA
        ${whereSql}
        ORDER BY
          cr.SEQUENCIAL DESC
      `
    );

    return {
      totalInconsistencias: result.recordset.length,
      items: result.recordset.map((row) => ({
        sequencial: this.parseInteger(row.sequencial),
        codigoEmpresa: String(row.codigoEmpresa ?? ''),
        enteDescricao: String(row.enteDescricao ?? ''),
        codigoPredio: String(row.codigoPredio ?? ''),
        descricaoPredio: String(row.descricaoPredio ?? ''),
        matricula: String(row.matricula ?? ''),
        cpf: String(row.cpf ?? ''),
        nome: String(row.nome ?? ''),
        situacaoCodigo: String(row.situacaoCodigo ?? ''),
        situacaoDescricao: String(row.situacaoDescricao ?? ''),
        regiaoCodigo: String(row.regiaoCodigo ?? ''),
        regiaoDescricao: String(row.regiaoDescricao ?? ''),
        motivo: String(row.motivo ?? '')
      }))
    };
  }
}
