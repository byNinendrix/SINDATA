import { getSqlPool, sql } from '../../database/sqlserver';
import type {
  ReportMetadataCatalog,
  ReportMetadataDataSource,
  ReportMetadataField,
  ReportMetadataFilterOperator,
  ReportMetadataRelation,
  ReportMetadataTable
} from './report-metadata.types';

interface DataSourceRow {
  id: string;
  name: string;
  description: string | null;
}

interface TableRow {
  id: string;
  source_id: string;
  technical_name: string;
  display_name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  sort_order: number | null;
  fields_count: number | null;
}

interface FieldRow {
  id: string;
  table_id: string;
  technical_name: string;
  display_name: string;
  description: string | null;
  data_type: 'text' | 'number' | 'date' | 'boolean' | 'option';
  is_selectable: boolean;
  is_filterable: boolean;
  is_sortable: boolean;
  is_groupable: boolean;
  is_sensitive: boolean;
  mask_type: 'none' | 'cpf' | 'name' | 'currency' | 'date' | null;
  sort_order: number | null;
}

interface RelationRow {
  id: string;
  source_table_id: string;
  source_field_id: string;
  target_table_id: string;
  target_field_id: string;
  relation_type: 'equals';
  display_label: string | null;
  is_required: boolean;
}

interface FilterOperatorRow {
  id: string;
  data_type: 'text' | 'number' | 'date' | 'boolean' | 'option';
  operator_code: string;
  display_name: string;
  requires_value: boolean;
  requires_second_value: boolean;
  sort_order: number | null;
}

function normalizeDataSource(row: DataSourceRow): ReportMetadataDataSource {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? ''
  };
}

function normalizeTable(row: TableRow): ReportMetadataTable {
  return {
    id: row.id,
    sourceId: row.source_id,
    technicalName: row.technical_name,
    displayName: row.display_name,
    description: row.description ?? '',
    category: row.category ?? 'outros',
    icon: row.icon ?? '',
    sortOrder: row.sort_order ?? 9999,
    fieldsCount: row.fields_count ?? 0
  };
}

function normalizeField(row: FieldRow): ReportMetadataField {
  return {
    id: row.id,
    tableId: row.table_id,
    technicalName: row.technical_name,
    displayName: row.display_name,
    description: row.description ?? '',
    dataType: row.data_type,
    isSelectable: Boolean(row.is_selectable),
    isFilterable: Boolean(row.is_filterable),
    isSortable: Boolean(row.is_sortable),
    isGroupable: Boolean(row.is_groupable),
    isSensitive: Boolean(row.is_sensitive),
    maskType: row.mask_type ?? 'none',
    sortOrder: row.sort_order ?? 9999
  };
}

function normalizeRelation(row: RelationRow): ReportMetadataRelation {
  return {
    id: row.id,
    sourceTableId: row.source_table_id,
    sourceFieldId: row.source_field_id,
    targetTableId: row.target_table_id,
    targetFieldId: row.target_field_id,
    relationType: row.relation_type,
    displayLabel: row.display_label ?? `${row.source_field_id} -> ${row.target_field_id}`,
    isRequired: Boolean(row.is_required)
  };
}

function normalizeFilterOperator(row: FilterOperatorRow): ReportMetadataFilterOperator {
  return {
    id: row.id,
    dataType: row.data_type,
    operator: row.operator_code,
    displayName: row.display_name,
    requiresValue: Boolean(row.requires_value),
    requiresSecondValue: Boolean(row.requires_second_value),
    sortOrder: row.sort_order ?? 9999
  };
}

export class ReportMetadataService {
  async getDataSources(): Promise<ReportMetadataDataSource[]> {
    const pool = await getSqlPool();
    const result = await pool.request().query<DataSourceRow>(`
      SELECT
        id,
        name,
        description
      FROM report_data_sources
      WHERE is_active = 1
      ORDER BY name
    `);

    return result.recordset.map(normalizeDataSource);
  }

  async getTables(): Promise<ReportMetadataTable[]> {
    const pool = await getSqlPool();
    const result = await pool.request().query<TableRow>(`
      SELECT
        t.id,
        t.source_id,
        t.technical_name,
        t.display_name,
        t.description,
        t.category,
        t.icon,
        t.sort_order,
        COUNT(f.id) AS fields_count
      FROM report_tables t
      LEFT JOIN report_fields f
        ON f.table_id = t.id
       AND f.is_active = 1
      WHERE t.is_active = 1
      GROUP BY
        t.id,
        t.source_id,
        t.technical_name,
        t.display_name,
        t.description,
        t.category,
        t.icon,
        t.sort_order
      ORDER BY t.sort_order, t.display_name
    `);

    return result.recordset.map(normalizeTable);
  }

  async getFields(tableId?: string): Promise<ReportMetadataField[]> {
    const pool = await getSqlPool();
    const request = pool.request();
    let where = `WHERE f.is_active = 1 AND t.is_active = 1`;

    if (tableId) {
      request.input('tableId', sql.VarChar(120), tableId);
      where += ` AND f.table_id = @tableId`;
    }

    const result = await request.query<FieldRow>(`
      SELECT
        f.id,
        f.table_id,
        f.technical_name,
        f.display_name,
        f.description,
        f.data_type,
        f.is_selectable,
        f.is_filterable,
        f.is_sortable,
        f.is_groupable,
        f.is_sensitive,
        f.mask_type,
        f.sort_order
      FROM report_fields f
      INNER JOIN report_tables t ON t.id = f.table_id
      ${where}
      ORDER BY t.sort_order, f.sort_order, f.display_name
    `);

    return result.recordset.map(normalizeField);
  }

  async getRelations(): Promise<ReportMetadataRelation[]> {
    const pool = await getSqlPool();
    const result = await pool.request().query<RelationRow>(`
      SELECT
        id,
        source_table_id,
        source_field_id,
        target_table_id,
        target_field_id,
        relation_type,
        display_label,
        is_required
      FROM report_relations
      WHERE is_active = 1
      ORDER BY display_label
    `);

    return result.recordset.map(normalizeRelation);
  }

  async getFilterOperators(): Promise<ReportMetadataFilterOperator[]> {
    const pool = await getSqlPool();
    const result = await pool.request().query<FilterOperatorRow>(`
      SELECT
        id,
        data_type,
        operator_code,
        display_name,
        requires_value,
        requires_second_value,
        sort_order
      FROM report_filter_operators
      WHERE is_active = 1
      ORDER BY data_type, sort_order, display_name
    `);

    return result.recordset.map(normalizeFilterOperator);
  }

  async getCatalog(): Promise<ReportMetadataCatalog> {
    const [dataSources, tables, fields, relations, filterOperators] = await Promise.all([
      this.getDataSources(),
      this.getTables(),
      this.getFields(),
      this.getRelations(),
      this.getFilterOperators()
    ]);

    return {
      dataSources,
      tables,
      fields,
      relations,
      filterOperators
    };
  }
}
