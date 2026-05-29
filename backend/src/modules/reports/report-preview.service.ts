import { getSqlPool, sql } from '../../database/sqlserver';
import type {
  ReportPreviewColumnResponse,
  ReportPreviewFilterPayload,
  ReportPreviewRequestPayload,
  ReportPreviewResponse
} from './report-preview.types';

type ReportFieldDataType = 'text' | 'number' | 'date' | 'boolean' | 'option';
type ReportMaskType = 'none' | 'cpf' | 'name' | 'currency' | 'date';

interface ReportTableRow {
  id: string;
  technical_name: string;
}

interface ReportFieldRow {
  id: string;
  table_id: string;
  technical_name: string;
  display_name: string;
  data_type: ReportFieldDataType;
  is_selectable: boolean;
  is_filterable: boolean;
  is_sortable: boolean;
  is_groupable: boolean;
  is_sensitive: boolean;
  mask_type: ReportMaskType;
}

interface ReportRelationRow {
  id: string;
  source_table_id: string;
  source_field_id: string;
  target_table_id: string;
  target_field_id: string;
  relation_type: 'equals';
}

interface ReportOperatorRow {
  id: string;
  data_type: ReportFieldDataType;
  operator_code: string;
  requires_value: boolean;
  requires_second_value: boolean;
}

interface CatalogSnapshot {
  tables: ReportTableRow[];
  fields: ReportFieldRow[];
  relations: ReportRelationRow[];
  operators: ReportOperatorRow[];
}

interface ValidatedSelectedField {
  field: ReportFieldRow;
  label: string;
  columnAlias: string;
}

interface ValidatedFilter {
  filter: ReportPreviewFilterPayload;
  field: ReportFieldRow;
  operator: ReportOperatorRow;
  connector: 'AND' | 'OR';
}

interface PreviewSettingsResolved {
  orderByFieldId: string;
  orderDirection: 'ASC' | 'DESC';
  page: number;
  pageSize: number;
  fetchSize: number;
  offset: number;
  maskCpf: boolean;
  maskName: boolean;
  removeDuplicates: boolean;
}

export class ReportPreviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportPreviewValidationError';
  }
}

function quoteIdentifier(value: string): string {
  return `[${value.replace(/]/g, ']]')}]`;
}

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function isTruthyBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'sim';
  }
  return false;
}

function toPositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function parseDateValue(value: unknown): Date {
  const raw = toStringValue(value).trim();
  const date = new Date(raw);
  if (!raw || Number.isNaN(date.getTime())) {
    throw new ReportPreviewValidationError('Valor de data invalido informado no filtro.');
  }
  return date;
}

function parseNumberValue(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ReportPreviewValidationError('Valor numerico invalido informado no filtro.');
  }
  return parsed;
}

function maskCpfValue(value: unknown): string {
  const raw = toStringValue(value);
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 11) {
    return raw;
  }
  return `***.***.***-${digits.slice(-2)}`;
}

function maskNameValue(value: unknown): string {
  const raw = toStringValue(value).trim();
  if (!raw) {
    return raw;
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return `${parts[0].slice(0, 1)}***`;
  }
  if (parts.length === 2) {
    return `${parts[0]} ***`;
  }
  return `${parts[0]} *** ${parts[parts.length - 1]}`;
}

function isUuid(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isNameMaskField(field: ReportFieldRow): boolean {
  if (field.mask_type === 'name') {
    return true;
  }
  if (field.id.toLowerCase() === 'pessoas.nome') {
    return true;
  }
  return field.technical_name.trim().toUpperCase() === 'NOME' && field.display_name.trim().toUpperCase() === 'NOME';
}

export class ReportPreviewService {
  private readonly maxPageSize = 100;
  private readonly defaultPage = 1;
  private readonly defaultPageSize = 50;

  private async resolveUserId(login: string): Promise<number | null> {
    const pool = await getSqlPool();
    const result = await pool.request().input('login', sql.VarChar(120), login).query<{ USR_CODIGO: number }>(`
      SELECT TOP 1 USR_CODIGO
      FROM FR_USUARIO
      WHERE LOWER(USR_LOGIN) = LOWER(@login)
    `);

    const userId = result.recordset[0]?.USR_CODIGO;
    return typeof userId === 'number' ? userId : null;
  }

  private async loadCatalogSnapshot(): Promise<CatalogSnapshot> {
    const pool = await getSqlPool();
    const [tablesResult, fieldsResult, relationsResult, operatorsResult] = await Promise.all([
      pool.request().query<ReportTableRow>(`
        SELECT id, technical_name
        FROM report_tables
        WHERE is_active = 1
      `),
      pool.request().query<ReportFieldRow>(`
        SELECT
          id,
          table_id,
          technical_name,
          display_name,
          data_type,
          is_selectable,
          is_filterable,
          is_sortable,
          is_groupable,
          is_sensitive,
          mask_type
        FROM report_fields
        WHERE is_active = 1
      `),
      pool.request().query<ReportRelationRow>(`
        SELECT
          id,
          source_table_id,
          source_field_id,
          target_table_id,
          target_field_id,
          relation_type
        FROM report_relations
        WHERE is_active = 1
      `),
      pool.request().query<ReportOperatorRow>(`
        SELECT
          id,
          data_type,
          operator_code,
          requires_value,
          requires_second_value
        FROM report_filter_operators
        WHERE is_active = 1
      `)
    ]);

    return {
      tables: tablesResult.recordset,
      fields: fieldsResult.recordset,
      relations: relationsResult.recordset,
      operators: operatorsResult.recordset
    };
  }

  private validateSelectedTables(payload: ReportPreviewRequestPayload, catalog: CatalogSnapshot): ReportTableRow[] {
    if (!Array.isArray(payload.selectedTables) || payload.selectedTables.length === 0) {
      throw new ReportPreviewValidationError('Selecione ao menos uma tabela.');
    }

    const uniqueTableIds = Array.from(new Set(payload.selectedTables.map((item) => String(item).trim()).filter(Boolean)));
    const tableById = new Map(catalog.tables.map((table) => [table.id, table]));
    const selectedTables = uniqueTableIds.map((tableId) => tableById.get(tableId)).filter(Boolean) as ReportTableRow[];

    if (selectedTables.length !== uniqueTableIds.length) {
      throw new ReportPreviewValidationError('Uma ou mais tabelas selecionadas nao estao disponiveis no catalogo.');
    }

    return selectedTables;
  }

  private validateSelectedFields(
    payload: ReportPreviewRequestPayload,
    selectedTables: ReportTableRow[],
    catalog: CatalogSnapshot
  ): ValidatedSelectedField[] {
    if (!Array.isArray(payload.selectedFields) || payload.selectedFields.length === 0) {
      throw new ReportPreviewValidationError('Selecione ao menos um campo para retorno.');
    }

    const tableIds = new Set(selectedTables.map((table) => table.id));
    const fieldById = new Map(catalog.fields.map((field) => [field.id, field]));
    const labelsInUse = new Set<string>();
    const validatedFields: ValidatedSelectedField[] = [];

    payload.selectedFields.forEach((selectedField, index) => {
      const fieldId = String(selectedField.fieldId ?? '').trim();
      const field = fieldById.get(fieldId);
      if (!field) {
        throw new ReportPreviewValidationError('O campo selecionado nao esta disponivel no catalogo.');
      }
      if (!tableIds.has(field.table_id)) {
        throw new ReportPreviewValidationError('Cada campo selecionado deve pertencer a uma tabela escolhida.');
      }
      if (!field.is_selectable) {
        throw new ReportPreviewValidationError('O campo selecionado nao pode ser usado como retorno.');
      }

      const baseLabel = String(selectedField.alias ?? '').trim() || field.display_name;
      let label = baseLabel || `coluna_${index + 1}`;
      let suffix = 2;
      while (labelsInUse.has(label.toLowerCase())) {
        label = `${baseLabel}_${suffix}`;
        suffix += 1;
      }
      labelsInUse.add(label.toLowerCase());

      validatedFields.push({
        field,
        label,
        columnAlias: `__c${index}`
      });
    });

    return validatedFields;
  }

  private validateRelations(
    payload: ReportPreviewRequestPayload,
    selectedTables: ReportTableRow[],
    catalog: CatalogSnapshot
  ): ReportRelationRow[] {
    if (selectedTables.length <= 1) {
      return [];
    }

    const relationInputs = payload.relations ?? [];
    if (relationInputs.length === 0) {
      throw new ReportPreviewValidationError('Selecione ligacoes homologadas no catalogo para conectar as tabelas.');
    }

    const selectedTableIds = new Set(selectedTables.map((table) => table.id));
    const normalized: ReportRelationRow[] = [];

    for (const relationInput of relationInputs) {
      const sourceFieldId = String(relationInput.sourceFieldId ?? '').trim();
      const targetFieldId = String(relationInput.targetFieldId ?? '').trim();
      const operator = String(relationInput.operator ?? '').trim().toLowerCase();
      if (!sourceFieldId || !targetFieldId || operator !== 'equals') {
        throw new ReportPreviewValidationError('Ligacao invalida informada para a previa do relatorio.');
      }

      const matched = catalog.relations.find((relation) => {
        const sameDirection = relation.source_field_id === sourceFieldId && relation.target_field_id === targetFieldId;
        const reverseDirection = relation.source_field_id === targetFieldId && relation.target_field_id === sourceFieldId;
        return relation.relation_type === 'equals' && (sameDirection || reverseDirection);
      });

      if (!matched) {
        throw new ReportPreviewValidationError(
          'Esta ligacao ainda nao esta homologada no catalogo de dados. Use uma ligacao sugerida pelo catalogo ou solicite homologacao da relacao.'
        );
      }

      if (!selectedTableIds.has(matched.source_table_id) || !selectedTableIds.has(matched.target_table_id)) {
        throw new ReportPreviewValidationError('Ligacao informada com tabela fora da selecao atual.');
      }

      normalized.push(matched);
    }

    return normalized;
  }

  private validateFilters(
    payload: ReportPreviewRequestPayload,
    selectedTables: ReportTableRow[],
    catalog: CatalogSnapshot
  ): ValidatedFilter[] {
    const filtersPayload = payload.filters ?? [];
    if (filtersPayload.length === 0) {
      return [];
    }

    const tableIds = new Set(selectedTables.map((table) => table.id));
    const fieldById = new Map(catalog.fields.map((field) => [field.id, field]));

    return filtersPayload.map((filter, index) => {
      const fieldId = String(filter.fieldId ?? '').trim();
      const operatorCode = String(filter.operator ?? '').trim().toLowerCase();
      const field = fieldById.get(fieldId);
      if (!field || !tableIds.has(field.table_id)) {
        throw new ReportPreviewValidationError('O campo selecionado nao esta disponivel no catalogo.');
      }
      if (!field.is_filterable) {
        throw new ReportPreviewValidationError('O campo nao pode ser usado como filtro.');
      }

      const operator = catalog.operators.find(
        (item) => item.data_type === field.data_type && item.operator_code.toLowerCase() === operatorCode
      );
      if (!operator) {
        throw new ReportPreviewValidationError('Operador de filtro incompativel com o tipo do campo.');
      }

      const hasValue = filter.value !== undefined && filter.value !== null && toStringValue(filter.value).trim() !== '';
      const hasSecondValue =
        filter.secondValue !== undefined &&
        filter.secondValue !== null &&
        toStringValue(filter.secondValue).trim() !== '';

      if (operator.requires_value && !hasValue) {
        throw new ReportPreviewValidationError('Preencha o valor do filtro para continuar.');
      }
      if (operator.requires_second_value && !hasSecondValue) {
        throw new ReportPreviewValidationError('Preencha o segundo valor do filtro para continuar.');
      }

      return {
        filter,
        field,
        operator,
        connector:
          index === 0
            ? 'AND'
            : String(filter.logicalConnector ?? 'AND').toUpperCase() === 'OR'
            ? 'OR'
            : 'AND'
      };
    });
  }

  private resolveSettings(payload: ReportPreviewRequestPayload, selectedFields: ValidatedSelectedField[]): PreviewSettingsResolved {
    const settings = payload.settings ?? {};

    const page = toPositiveInteger(settings.page, this.defaultPage);
    const requestedPageSize = toPositiveInteger(settings.pageSize, this.defaultPageSize);
    const requestedLimit = toPositiveInteger(settings.limit, requestedPageSize);
    const pageSize = Math.min(requestedPageSize, requestedLimit);

    if (requestedPageSize > this.maxPageSize || requestedLimit > this.maxPageSize) {
      throw new ReportPreviewValidationError('O limite maximo para previa e 100 registros.');
    }

    const orderByFieldId = String(settings.orderByFieldId ?? '').trim() || selectedFields[0]?.field.id || '';
    if (!orderByFieldId) {
      throw new ReportPreviewValidationError('Selecione ao menos um campo para retorno.');
    }

    return {
      orderByFieldId,
      orderDirection: String(settings.orderDirection ?? 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC',
      page,
      pageSize,
      fetchSize: Math.min(pageSize + 1, this.maxPageSize),
      offset: (page - 1) * pageSize,
      maskCpf: Boolean(settings.maskCpf),
      maskName: Boolean(settings.maskName),
      removeDuplicates: Boolean(settings.removeDuplicates)
    };
  }

  private addStringParam(request: sql.Request, counter: number, value: unknown): string {
    const name = `p_${counter}`;
    request.input(name, sql.NVarChar(sql.MAX), toStringValue(value));
    return `@${name}`;
  }

  private addNumberParam(request: sql.Request, counter: number, value: unknown): string {
    const name = `p_${counter}`;
    request.input(name, sql.Float, parseNumberValue(value));
    return `@${name}`;
  }

  private addDateParam(request: sql.Request, counter: number, value: unknown): string {
    const name = `p_${counter}`;
    request.input(name, sql.Date, parseDateValue(value));
    return `@${name}`;
  }

  private buildFiltersSql(
    filters: ValidatedFilter[],
    tableAliasById: Map<string, string>,
    request: sql.Request
  ): string[] {
    const whereParts: string[] = [];
    let paramCounter = 0;

    for (const { filter, field, operator, connector } of filters) {
      const tableAlias = tableAliasById.get(field.table_id);
      if (!tableAlias) {
        throw new ReportPreviewValidationError('Filtro informado para tabela nao selecionada.');
      }

      const rawField = `${tableAlias}.${quoteIdentifier(field.technical_name)}`;
      const asText = `CAST(${rawField} AS NVARCHAR(4000))`;
      const asNumber = `TRY_CONVERT(DECIMAL(38,10), ${rawField})`;
      const asDate = `TRY_CONVERT(DATE, ${rawField})`;
      const op = operator.operator_code.toLowerCase();
      let clause = '';

      if (op === 'contains') {
        const param = this.addStringParam(request, paramCounter++, `%${toStringValue(filter.value)}%`);
        clause = `${asText} LIKE ${param}`;
      } else if (op === 'not_contains') {
        const param = this.addStringParam(request, paramCounter++, `%${toStringValue(filter.value)}%`);
        clause = `${asText} NOT LIKE ${param}`;
      } else if (op === 'equals') {
        if (field.data_type === 'number') {
          const param = this.addNumberParam(request, paramCounter++, filter.value);
          clause = `${asNumber} = ${param}`;
        } else if (field.data_type === 'date') {
          const param = this.addDateParam(request, paramCounter++, filter.value);
          clause = `${asDate} = ${param}`;
        } else {
          const param = this.addStringParam(request, paramCounter++, filter.value);
          clause = `${asText} = ${param}`;
        }
      } else if (op === 'not_equals') {
        if (field.data_type === 'number') {
          const param = this.addNumberParam(request, paramCounter++, filter.value);
          clause = `${asNumber} <> ${param}`;
        } else if (field.data_type === 'date') {
          const param = this.addDateParam(request, paramCounter++, filter.value);
          clause = `${asDate} <> ${param}`;
        } else {
          const param = this.addStringParam(request, paramCounter++, filter.value);
          clause = `${asText} <> ${param}`;
        }
      } else if (op === 'starts_with') {
        const param = this.addStringParam(request, paramCounter++, `${toStringValue(filter.value)}%`);
        clause = `${asText} LIKE ${param}`;
      } else if (op === 'ends_with') {
        const param = this.addStringParam(request, paramCounter++, `%${toStringValue(filter.value)}`);
        clause = `${asText} LIKE ${param}`;
      } else if (op === 'is_empty') {
        clause = `(${rawField} IS NULL OR LTRIM(RTRIM(${asText})) = '')`;
      } else if (op === 'is_not_empty') {
        clause = `(${rawField} IS NOT NULL AND LTRIM(RTRIM(${asText})) <> '')`;
      } else if (op === 'greater_than') {
        const param = field.data_type === 'date'
          ? this.addDateParam(request, paramCounter++, filter.value)
          : this.addNumberParam(request, paramCounter++, filter.value);
        clause = `${field.data_type === 'date' ? asDate : asNumber} > ${param}`;
      } else if (op === 'greater_or_equal') {
        const param = field.data_type === 'date'
          ? this.addDateParam(request, paramCounter++, filter.value)
          : this.addNumberParam(request, paramCounter++, filter.value);
        clause = `${field.data_type === 'date' ? asDate : asNumber} >= ${param}`;
      } else if (op === 'less_than') {
        const param = field.data_type === 'date'
          ? this.addDateParam(request, paramCounter++, filter.value)
          : this.addNumberParam(request, paramCounter++, filter.value);
        clause = `${field.data_type === 'date' ? asDate : asNumber} < ${param}`;
      } else if (op === 'less_or_equal') {
        const param = field.data_type === 'date'
          ? this.addDateParam(request, paramCounter++, filter.value)
          : this.addNumberParam(request, paramCounter++, filter.value);
        clause = `${field.data_type === 'date' ? asDate : asNumber} <= ${param}`;
      } else if (op === 'between') {
        const paramA =
          field.data_type === 'date'
            ? this.addDateParam(request, paramCounter++, filter.value)
            : field.data_type === 'number'
            ? this.addNumberParam(request, paramCounter++, filter.value)
            : this.addStringParam(request, paramCounter++, filter.value);
        const paramB =
          field.data_type === 'date'
            ? this.addDateParam(request, paramCounter++, filter.secondValue)
            : field.data_type === 'number'
            ? this.addNumberParam(request, paramCounter++, filter.secondValue)
            : this.addStringParam(request, paramCounter++, filter.secondValue);
        const expr = field.data_type === 'date' ? asDate : field.data_type === 'number' ? asNumber : asText;
        clause = `${expr} BETWEEN ${paramA} AND ${paramB}`;
      } else if (op === 'before') {
        const param = this.addDateParam(request, paramCounter++, filter.value);
        clause = `${asDate} < ${param}`;
      } else if (op === 'after') {
        const param = this.addDateParam(request, paramCounter++, filter.value);
        clause = `${asDate} > ${param}`;
      } else if (op === 'current_month') {
        clause = `YEAR(${asDate}) = YEAR(GETDATE()) AND MONTH(${asDate}) = MONTH(GETDATE())`;
      } else if (op === 'current_year') {
        clause = `YEAR(${asDate}) = YEAR(GETDATE())`;
      } else if (op === 'last_7_days') {
        clause = `${asDate} >= DATEADD(DAY, -7, CAST(GETDATE() AS DATE))`;
      } else if (op === 'last_30_days') {
        clause = `${asDate} >= DATEADD(DAY, -30, CAST(GETDATE() AS DATE))`;
      } else if (op === 'is_true') {
        clause = `TRY_CONVERT(INT, ${rawField}) = 1`;
      } else if (op === 'is_false') {
        clause = `TRY_CONVERT(INT, ${rawField}) = 0`;
      } else if (op === 'in' || op === 'not_in') {
        const rawValue = filter.value;
        const values = Array.isArray(rawValue)
          ? rawValue.map((item) => toStringValue(item).trim()).filter(Boolean)
          : toStringValue(rawValue)
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);
        if (values.length === 0) {
          throw new ReportPreviewValidationError('Informe ao menos um valor para o operador selecionado.');
        }
        const params = values.map((value) => this.addStringParam(request, paramCounter++, value));
        clause = `${asText} ${op === 'in' ? 'IN' : 'NOT IN'} (${params.join(', ')})`;
      } else {
        throw new ReportPreviewValidationError('Operador de filtro incompativel com o tipo do campo.');
      }

      if (!clause) {
        continue;
      }

      if (whereParts.length === 0) {
        whereParts.push(`(${clause})`);
      } else {
        whereParts.push(`${connector} (${clause})`);
      }
    }

    return whereParts;
  }

  private async saveExecutionLog(payload: {
    reportModelId?: string;
    login: string;
    status: 'success' | 'error';
    filtersSummary: string;
    rowsReturned: number;
    executionTimeMs: number;
    errorMessage?: string;
  }): Promise<void> {
    const pool = await getSqlPool();
    const userId = await this.resolveUserId(payload.login);
    const hasModelId = isUuid(payload.reportModelId);

    await pool
      .request()
      .input('reportModelId', sql.UniqueIdentifier, hasModelId ? payload.reportModelId : null)
      .input('userId', sql.Int, userId)
      .input('userLogin', sql.VarChar(120), payload.login)
      .input('action', sql.VarChar(30), 'preview')
      .input('status', sql.VarChar(20), payload.status)
      .input('filtersSummary', sql.NVarChar(1000), payload.filtersSummary.slice(0, 1000))
      .input('rowsReturned', sql.Int, payload.rowsReturned)
      .input('executionTimeMs', sql.Int, payload.executionTimeMs)
      .input('errorMessage', sql.NVarChar(1000), (payload.errorMessage ?? '').slice(0, 1000))
      .query(`
        INSERT INTO report_execution_logs (
          report_model_id,
          user_id,
          user_login,
          action,
          status,
          filters_summary,
          rows_returned,
          execution_time_ms,
          error_message
        ) VALUES (
          @reportModelId,
          @userId,
          @userLogin,
          @action,
          @status,
          @filtersSummary,
          @rowsReturned,
          @executionTimeMs,
          @errorMessage
        )
      `);
  }

  async preview(login: string, payload: ReportPreviewRequestPayload): Promise<ReportPreviewResponse> {
    const startedAt = Date.now();
    let rowsReturned = 0;
    let filtersSummary = '';
    let status: 'success' | 'error' = 'success';
    let errorMessage = '';

    try {
      const catalog = await this.loadCatalogSnapshot();
      const selectedTables = this.validateSelectedTables(payload, catalog);
      const selectedFields = this.validateSelectedFields(payload, selectedTables, catalog);
      const selectedRelations = this.validateRelations(payload, selectedTables, catalog);
      const validatedFilters = this.validateFilters(payload, selectedTables, catalog);
      const settings = this.resolveSettings(payload, selectedFields);

      const fieldById = new Map(catalog.fields.map((field) => [field.id, field]));
      const tableAliasById = new Map<string, string>();
      selectedTables.forEach((table, index) => {
        tableAliasById.set(table.id, `t${index + 1}`);
      });

      const baseTable = selectedTables[0];
      const baseAlias = tableAliasById.get(baseTable.id) ?? 't1';

      const joinedTables = new Set<string>([baseTable.id]);
      const usedRelationIds = new Set<string>();
      const joinClauses: string[] = [];
      const additionalRelationClauses: string[] = [];

      while (joinedTables.size < selectedTables.length) {
        let progressed = false;

        for (const relation of selectedRelations) {
          if (usedRelationIds.has(relation.id)) {
            continue;
          }

          const sourceJoined = joinedTables.has(relation.source_table_id);
          const targetJoined = joinedTables.has(relation.target_table_id);
          const sourceAlias = tableAliasById.get(relation.source_table_id);
          const targetAlias = tableAliasById.get(relation.target_table_id);
          const sourceField = fieldById.get(relation.source_field_id);
          const targetField = fieldById.get(relation.target_field_id);
          if (!sourceAlias || !targetAlias || !sourceField || !targetField) {
            continue;
          }

          const predicate = `${sourceAlias}.${quoteIdentifier(sourceField.technical_name)} = ${targetAlias}.${quoteIdentifier(
            targetField.technical_name
          )}`;

          if (sourceJoined && !targetJoined) {
            const targetTable = selectedTables.find((table) => table.id === relation.target_table_id);
            if (!targetTable) {
              continue;
            }
            joinClauses.push(`INNER JOIN ${quoteIdentifier(targetTable.technical_name)} ${targetAlias} ON ${predicate}`);
            joinedTables.add(targetTable.id);
            usedRelationIds.add(relation.id);
            progressed = true;
            break;
          }

          if (targetJoined && !sourceJoined) {
            const sourceTable = selectedTables.find((table) => table.id === relation.source_table_id);
            if (!sourceTable) {
              continue;
            }
            joinClauses.push(`INNER JOIN ${quoteIdentifier(sourceTable.technical_name)} ${sourceAlias} ON ${predicate}`);
            joinedTables.add(sourceTable.id);
            usedRelationIds.add(relation.id);
            progressed = true;
            break;
          }

          if (sourceJoined && targetJoined) {
            additionalRelationClauses.push(predicate);
            usedRelationIds.add(relation.id);
            progressed = true;
          }
        }

        if (!progressed) {
          throw new ReportPreviewValidationError(
            'Esta ligacao ainda nao esta homologada no catalogo de dados. Use uma ligacao sugerida pelo catalogo ou solicite homologacao da relacao.'
          );
        }
      }

      const orderByField = fieldById.get(settings.orderByFieldId);
      if (!orderByField || !orderByField.is_sortable || !tableAliasById.has(orderByField.table_id)) {
        throw new ReportPreviewValidationError('O campo de ordenacao selecionado nao esta disponivel no catalogo.');
      }

      const request = (await getSqlPool())
        .request()
        .input('offsetRows', sql.Int, settings.offset)
        .input('fetchRows', sql.Int, settings.fetchSize);

      const filterClauses = this.buildFiltersSql(validatedFilters, tableAliasById, request);
      const whereClauses = [...additionalRelationClauses];
      if (filterClauses.length > 0) {
        whereClauses.push(filterClauses.join(' '));
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const distinctSql = settings.removeDuplicates ? 'DISTINCT' : '';

      const selectColumnsSql = selectedFields
        .map((item) => {
          const tableAlias = tableAliasById.get(item.field.table_id);
          if (!tableAlias) {
            throw new ReportPreviewValidationError('Falha ao resolver tabela do campo selecionado.');
          }
          return `${tableAlias}.${quoteIdentifier(item.field.technical_name)} AS ${quoteIdentifier(item.columnAlias)}`;
        })
        .join(',\n          ');

      const orderAlias = tableAliasById.get(orderByField.table_id);
      if (!orderAlias) {
        throw new ReportPreviewValidationError('Campo de ordenacao invalido para as tabelas selecionadas.');
      }

      const query = `
        SELECT ${distinctSql}
          ${selectColumnsSql}
        FROM ${quoteIdentifier(baseTable.technical_name)} ${baseAlias}
        ${joinClauses.join('\n        ')}
        ${whereSql}
        ORDER BY ${orderAlias}.${quoteIdentifier(orderByField.technical_name)} ${settings.orderDirection}
        OFFSET @offsetRows ROWS FETCH NEXT @fetchRows ROWS ONLY
      `;

      const result = await request.query<Record<string, unknown>>(query);
      const hasMore = result.recordset.length > settings.pageSize;
      const rawRows = hasMore ? result.recordset.slice(0, settings.pageSize) : result.recordset;

      const columns: ReportPreviewColumnResponse[] = selectedFields.map((item) => ({
        fieldId: item.field.id,
        label: item.label,
        dataType: item.field.data_type,
        isSensitive: item.field.is_sensitive,
        maskType: item.field.mask_type,
        masked:
          (item.field.mask_type === 'cpf' && settings.maskCpf) || (isNameMaskField(item.field) && settings.maskName)
      }));

      const rows = rawRows.map((row) => {
        const responseRow: Record<string, unknown> = {};
        selectedFields.forEach((item) => {
          const rawValue = row[item.columnAlias];
          // Fase atual: os checkboxes de mascara controlam CPF e Nome na previa.
          // TODO (proxima fase): sobrescrever este comportamento por permissao de perfil/campo quando aplicavel.
          const shouldMaskCpf = item.field.mask_type === 'cpf' && settings.maskCpf;
          const shouldMaskName = isNameMaskField(item.field) && settings.maskName;
          const maskedValue = shouldMaskCpf ? maskCpfValue(rawValue) : shouldMaskName ? maskNameValue(rawValue) : rawValue;
          const value = maskedValue instanceof Date ? maskedValue.toISOString() : maskedValue;
          responseRow[item.label] = value ?? '-';
        });
        return responseRow;
      });

      rowsReturned = rows.length;
      filtersSummary = validatedFilters
        .map((item) => `${item.field.id}:${item.operator.operator_code}`)
        .slice(0, 20)
        .join(' | ');

      const executionTimeMs = Date.now() - startedAt;
      return {
        columns,
        rows,
        pagination: {
          page: settings.page,
          pageSize: settings.pageSize,
          rowsReturned,
          hasMore
        },
        summary: {
          tablesCount: selectedTables.length,
          fieldsCount: selectedFields.length,
          filtersCount: validatedFilters.length,
          relationsCount: selectedRelations.length,
          executionTimeMs
        },
        warnings: []
      };
    } catch (error) {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : 'Nao foi possivel gerar a previa do relatorio.';
      throw error;
    } finally {
      const executionTimeMs = Date.now() - startedAt;
      try {
        await this.saveExecutionLog({
          reportModelId: payload.reportModelId,
          login,
          status,
          filtersSummary,
          rowsReturned,
          executionTimeMs,
          errorMessage
        });
      } catch {
        // Mantem a resposta principal da previa mesmo se o log falhar.
      }
    }
  }
}
