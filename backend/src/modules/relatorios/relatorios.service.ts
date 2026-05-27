import { queryReadOnly } from '../../database/readOnlyGuard';
import { getSqlPool, sql } from '../../database/sqlserver';

interface PreviewRelationPayload {
  sourceTableId: string;
  sourceFieldId: string;
  targetTableId: string;
  targetFieldId: string;
  operator: 'equals';
}

interface PreviewFilterPayload {
  tableId: string;
  fieldId: string;
  condition: 'Igual a' | 'Diferente de' | 'Contem' | 'Maior que' | 'Menor que' | 'Entre';
  value: string;
  secondValue?: string;
}

export interface ReportPreviewPayload {
  selectedTableIds: string[];
  selectedFieldKeys: string[];
  manualRelations: PreviewRelationPayload[];
  filters?: PreviewFilterPayload[];
  limit?: number;
  orderBy?: string;
}

interface PhysicalTableConfig {
  tableId: string;
  schema: string;
  tableName: string;
  alias: string;
}

interface ResolvedField {
  tableId: string;
  fieldId: string;
  alias: string;
  columnName: string;
}

const SUPPORTED_TABLES: Record<string, PhysicalTableConfig> = {
  pessoas: { tableId: 'pessoas', schema: 'dbo', tableName: 'PESSOAS', alias: 'p' },
  filiacoes: { tableId: 'filiacoes', schema: 'dbo', tableName: 'FILIADO', alias: 'f' },
  escolas: { tableId: 'escolas', schema: 'dbo', tableName: 'PREDIO', alias: 'pr' },
  ente_publico: { tableId: 'ente_publico', schema: 'dbo', tableName: 'EMPRESA', alias: 'e' }
};

const MAX_PREVIEW_ROWS = 50;

export interface ReportPreviewResponse {
  rows: Array<Record<string, unknown>>;
  source: 'database';
  appliedLimit: number;
}

export class RelatoriosService {
  private readonly columnsCache = new Map<string, Set<string>>();

  private async getAllowedColumns(table: PhysicalTableConfig): Promise<Set<string>> {
    const cacheKey = `${table.schema}.${table.tableName}`;
    const cached = this.columnsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const pool = await getSqlPool();
    const request = pool
      .request()
      .input('schemaName', sql.VarChar(128), table.schema)
      .input('tableName', sql.VarChar(128), table.tableName);

    const result = await queryReadOnly<{ COLUMN_NAME: string }>(
      request,
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = @tableName
      `
    );

    const columns = new Set(result.recordset.map((item) => item.COLUMN_NAME.toUpperCase()));
    this.columnsCache.set(cacheKey, columns);
    return columns;
  }

  private resolveColumnName(fieldId: string, allowedColumns: Set<string>): string | null {
    const candidate = fieldId.trim().toUpperCase();
    if (allowedColumns.has(candidate)) {
      return candidate;
    }
    return null;
  }

  private parseFieldKey(fieldKey: string): { tableId: string; fieldId: string } {
    const parts = fieldKey.split('.');
    if (parts.length !== 2) {
      throw new Error(`Campo inválido informado para prévia: ${fieldKey}.`);
    }
    const [tableId, fieldId] = parts;
    if (!tableId || !fieldId) {
      throw new Error(`Campo inválido informado para prévia: ${fieldKey}.`);
    }
    return { tableId, fieldId };
  }

  private getTableConfig(tableId: string): PhysicalTableConfig {
    const table = SUPPORTED_TABLES[tableId];
    if (!table) {
      throw new Error(`A tabela ${tableId} ainda não está disponível para prévia real nesta etapa.`);
    }
    return table;
  }

  async getPreview(payload: ReportPreviewPayload): Promise<ReportPreviewResponse> {
    if (!payload.selectedFieldKeys?.length) {
      return {
        rows: [],
        source: 'database',
        appliedLimit: 0
      };
    }

    const limit = Math.min(Math.max(payload.limit ?? 5, 1), MAX_PREVIEW_ROWS);
    const parsedSelectedFields = payload.selectedFieldKeys.map((fieldKey) => this.parseFieldKey(fieldKey));

    const tableIds = new Set<string>();
    (payload.selectedTableIds ?? []).forEach((tableId) => tableIds.add(tableId));
    parsedSelectedFields.forEach((field) => tableIds.add(field.tableId));
    payload.manualRelations.forEach((relation) => {
      tableIds.add(relation.sourceTableId);
      tableIds.add(relation.targetTableId);
    });
    (payload.filters ?? []).forEach((filter) => tableIds.add(filter.tableId));

    const tableConfigs = new Map<string, PhysicalTableConfig>();
    Array.from(tableIds).forEach((tableId) => {
      tableConfigs.set(tableId, this.getTableConfig(tableId));
    });

    const allowedColumnsByTable = new Map<string, Set<string>>();
    for (const table of tableConfigs.values()) {
      allowedColumnsByTable.set(table.tableId, await this.getAllowedColumns(table));
    }

    const resolvedFields: ResolvedField[] = parsedSelectedFields.map((field) => {
      const table = tableConfigs.get(field.tableId);
      if (!table) {
        throw new Error(`Tabela inválida para prévia real: ${field.tableId}.`);
      }
      const allowedColumns = allowedColumnsByTable.get(field.tableId);
      if (!allowedColumns) {
        throw new Error(`Tabela sem metadados para prévia real: ${field.tableId}.`);
      }
      const columnName = this.resolveColumnName(field.fieldId, allowedColumns);
      if (!columnName) {
        throw new Error(`Campo ${field.fieldId} não está disponível na tabela ${field.tableId}.`);
      }
      return {
        tableId: field.tableId,
        fieldId: field.fieldId,
        alias: table.alias,
        columnName
      };
    });

    const relationConditions = payload.manualRelations.map((relation) => {
      const sourceTable = tableConfigs.get(relation.sourceTableId);
      const targetTable = tableConfigs.get(relation.targetTableId);
      if (!sourceTable || !targetTable) {
        throw new Error('Ligação com tabela não suportada para prévia real.');
      }
      if (sourceTable.tableId === targetTable.tableId) {
        throw new Error('Escolha tabelas diferentes para criar a ligação nesta etapa.');
      }

      const sourceAllowed = allowedColumnsByTable.get(sourceTable.tableId);
      const targetAllowed = allowedColumnsByTable.get(targetTable.tableId);
      if (!sourceAllowed || !targetAllowed) {
        throw new Error('Metadados de ligação não disponíveis para as tabelas selecionadas.');
      }

      const sourceColumn = this.resolveColumnName(relation.sourceFieldId, sourceAllowed);
      const targetColumn = this.resolveColumnName(relation.targetFieldId, targetAllowed);
      if (!sourceColumn || !targetColumn) {
        throw new Error('Ligação com campo inválido para prévia real.');
      }

      return {
        sourceTableId: relation.sourceTableId,
        sourceAlias: sourceTable.alias,
        sourceColumn,
        targetTableId: relation.targetTableId,
        targetAlias: targetTable.alias,
        targetColumn
      };
    });

    const requiredTables = new Set<string>();
    resolvedFields.forEach((field) => requiredTables.add(field.tableId));
    relationConditions.forEach((relation) => {
      requiredTables.add(relation.sourceTableId);
      requiredTables.add(relation.targetTableId);
    });
    const baseTableId = parsedSelectedFields[0].tableId;
    const baseTable = tableConfigs.get(baseTableId);
    if (!baseTable) {
      throw new Error('Não foi possível identificar a tabela base da prévia.');
    }

    const joinedTables = new Set<string>([baseTable.tableId]);
    const joinClauses: string[] = [];
    const usedRelationIndexes = new Set<number>();

    while (joinedTables.size < requiredTables.size) {
      let connected = false;

      for (let index = 0; index < relationConditions.length; index += 1) {
        if (usedRelationIndexes.has(index)) {
          continue;
        }

        const relation = relationConditions[index];
        const sourceJoined = joinedTables.has(relation.sourceTableId);
        const targetJoined = joinedTables.has(relation.targetTableId);
        const sourceRequired = requiredTables.has(relation.sourceTableId);
        const targetRequired = requiredTables.has(relation.targetTableId);

        if (sourceJoined && !targetJoined && targetRequired) {
          const targetTable = tableConfigs.get(relation.targetTableId);
          if (!targetTable) {
            continue;
          }
          joinClauses.push(
            `INNER JOIN ${targetTable.schema}.${targetTable.tableName} AS ${targetTable.alias} ON ${relation.sourceAlias}.[${relation.sourceColumn}] = ${relation.targetAlias}.[${relation.targetColumn}]`
          );
          joinedTables.add(relation.targetTableId);
          usedRelationIndexes.add(index);
          connected = true;
          break;
        }

        if (targetJoined && !sourceJoined && sourceRequired) {
          const sourceTable = tableConfigs.get(relation.sourceTableId);
          if (!sourceTable) {
            continue;
          }
          joinClauses.push(
            `INNER JOIN ${sourceTable.schema}.${sourceTable.tableName} AS ${sourceTable.alias} ON ${sourceTable.alias}.[${relation.sourceColumn}] = ${relation.targetAlias}.[${relation.targetColumn}]`
          );
          joinedTables.add(relation.sourceTableId);
          usedRelationIndexes.add(index);
          connected = true;
          break;
        }
      }

      if (!connected) {
        const pendingTableIds = Array.from(requiredTables).filter((tableId) => !joinedTables.has(tableId));
        throw new Error(
          `Não foi possível conectar todas as tabelas selecionadas. Tabelas sem conexão: ${pendingTableIds.join(', ')}. Revise as ligações entre os campos para gerar a prévia real.`
        );
      }
    }

    const whereClauses: string[] = [];
    relationConditions.forEach((relation, index) => {
      if (usedRelationIndexes.has(index)) {
        return;
      }
      if (joinedTables.has(relation.sourceTableId) && joinedTables.has(relation.targetTableId)) {
        whereClauses.push(
          `${relation.sourceAlias}.[${relation.sourceColumn}] = ${relation.targetAlias}.[${relation.targetColumn}]`
        );
      }
    });

    const pool = await getSqlPool();
    const request = pool.request().input('previewLimit', sql.Int, limit);

    for (const [filterIndex, filter] of (payload.filters ?? []).entries()) {
      if (!joinedTables.has(filter.tableId)) {
        continue;
      }
      const table = tableConfigs.get(filter.tableId);
      const allowedColumns = allowedColumnsByTable.get(filter.tableId);
      if (!table || !allowedColumns) {
        continue;
      }
      const column = this.resolveColumnName(filter.fieldId, allowedColumns);
      if (!column) {
        continue;
      }

      const fieldSql = `${table.alias}.[${column}]`;
      const valueParam = `filter_${filterIndex}`;
      const secondValueParam = `filter_${filterIndex}_second`;

      if (filter.condition === 'Igual a') {
        request.input(valueParam, sql.NVarChar, filter.value ?? '');
        whereClauses.push(`${fieldSql} = @${valueParam}`);
      } else if (filter.condition === 'Diferente de') {
        request.input(valueParam, sql.NVarChar, filter.value ?? '');
        whereClauses.push(`${fieldSql} <> @${valueParam}`);
      } else if (filter.condition === 'Contem') {
        request.input(valueParam, sql.NVarChar, `%${filter.value ?? ''}%`);
        whereClauses.push(`CAST(${fieldSql} AS NVARCHAR(4000)) LIKE @${valueParam}`);
      } else if (filter.condition === 'Maior que') {
        request.input(valueParam, sql.NVarChar, filter.value ?? '');
        whereClauses.push(`CAST(${fieldSql} AS NVARCHAR(4000)) > @${valueParam}`);
      } else if (filter.condition === 'Menor que') {
        request.input(valueParam, sql.NVarChar, filter.value ?? '');
        whereClauses.push(`CAST(${fieldSql} AS NVARCHAR(4000)) < @${valueParam}`);
      } else if (filter.condition === 'Entre' && filter.secondValue) {
        request.input(valueParam, sql.NVarChar, filter.value ?? '');
        request.input(secondValueParam, sql.NVarChar, filter.secondValue ?? '');
        whereClauses.push(`CAST(${fieldSql} AS NVARCHAR(4000)) BETWEEN @${valueParam} AND @${secondValueParam}`);
      }
    }

    const selectColumns = resolvedFields.map(
      (field) => `${field.alias}.[${field.columnName}] AS [${field.tableId}.${field.fieldId}]`
    );
    const fromClause = `FROM ${baseTable.schema}.${baseTable.tableName} AS ${baseTable.alias}`;

    let orderByClause = '';
    if (payload.orderBy) {
      const parsedOrderBy = this.parseFieldKey(payload.orderBy);
      const orderByField = resolvedFields.find(
        (field) => field.tableId === parsedOrderBy.tableId && field.fieldId === parsedOrderBy.fieldId
      );
      if (orderByField) {
        orderByClause = `ORDER BY ${orderByField.alias}.[${orderByField.columnName}]`;
      }
    }

    if (!orderByClause) {
      const firstField = resolvedFields[0];
      orderByClause = `ORDER BY ${firstField.alias}.[${firstField.columnName}]`;
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sqlQuery = `
      SELECT TOP (@previewLimit)
        ${selectColumns.join(',\n        ')}
      ${fromClause}
      ${joinClauses.join('\n      ')}
      ${whereClause}
      ${orderByClause}
    `;

    const result = await queryReadOnly<Record<string, unknown>>(request, sqlQuery);
    const rows = result.recordset.map((row) => {
      const nextRow: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        if (value === null || value === undefined) {
          nextRow[key] = '-';
          continue;
        }
        if (value instanceof Date) {
          nextRow[key] = value.toISOString().slice(0, 10);
          continue;
        }
        nextRow[key] = value;
      }
      return nextRow;
    });

    return {
      rows,
      source: 'database',
      appliedLimit: limit
    };
  }
}
