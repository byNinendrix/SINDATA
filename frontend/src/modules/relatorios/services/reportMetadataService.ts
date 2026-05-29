import { isAxiosError } from 'axios';
import api from '../../../services/api';
import {
  reportFilterConditionsByType,
  reportTableCategoryLabels,
  reportTablesMetadataMock
} from '../mocks/reportBuilderMocks';
import type {
  ReportFieldType,
  ReportFilterCondition,
  ReportMetadataFilterOperator,
  ReportMetadataRelationSuggestion,
  ReportTableMetadata
} from '../types/reportBuilder.types';

const METADATA_FALLBACK_WARNING =
  'Nao foi possivel carregar metadados do servidor. Usando catalogo local temporario.';
const METADATA_FALLBACK_SIMULATION_WARNING =
  'Nao foi possivel carregar metadados do servidor. Usando catalogo local temporario.';

interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiMetadataDataSource {
  id: string;
  name: string;
  description: string;
}

interface ApiMetadataTable {
  id: string;
  sourceId: string;
  technicalName: string;
  displayName: string;
  description: string;
  category: string;
  icon: string;
  sortOrder: number;
  fieldsCount: number;
}

interface ApiMetadataField {
  id: string;
  tableId: string;
  technicalName: string;
  displayName: string;
  description: string;
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'option';
  isSelectable: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  isGroupable: boolean;
  isSensitive: boolean;
  maskType: 'none' | 'cpf' | 'name' | 'currency' | 'date';
  sortOrder: number;
}

interface ApiMetadataRelation {
  id: string;
  sourceTableId: string;
  sourceFieldId: string;
  targetTableId: string;
  targetFieldId: string;
  relationType: 'equals';
  displayLabel: string;
  isRequired: boolean;
}

interface ApiMetadataFilterOperator {
  id: string;
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'option';
  operator: string;
  displayName: string;
  requiresValue: boolean;
  requiresSecondValue: boolean;
  sortOrder: number;
}

interface ApiMetadataCatalog {
  dataSources: ApiMetadataDataSource[];
  tables: ApiMetadataTable[];
  fields: ApiMetadataField[];
  relations: ApiMetadataRelation[];
  filterOperators: ApiMetadataFilterOperator[];
}

export type ReportMetadataMode = 'api' | 'mock';

export interface ReportMetadataResult<T> {
  data: T;
  mode: ReportMetadataMode;
  warning?: string;
}

export interface ReportMetadataFrontendCatalog {
  tables: ReportTableMetadata[];
  categoryLabels: Record<string, string>;
  relations: ReportMetadataRelationSuggestion[];
  operatorsByType: Record<ReportFieldType, ReportFilterCondition[]>;
  operatorMetadataByType: Record<ReportFieldType, ReportMetadataFilterOperator[]>;
}

const categoryLabelsFallback = reportTableCategoryLabels as Record<string, string>;

function toFieldType(dataType: ApiMetadataField['dataType']): ReportFieldType {
  if (dataType === 'number') {
    return 'numero';
  }
  if (dataType === 'date') {
    return 'data';
  }
  if (dataType === 'boolean') {
    return 'booleano';
  }
  if (dataType === 'option') {
    return 'lista';
  }
  return 'texto';
}

function getFieldIdWithinTable(fieldId: string, tableId: string) {
  const prefix = `${tableId}.`;
  if (fieldId.startsWith(prefix)) {
    return fieldId.slice(prefix.length);
  }
  return fieldId;
}

function normalizeOperatorLabel(displayName: string): ReportFilterCondition {
  const map: Record<string, ReportFilterCondition> = {
    Contem: 'Contem',
    'Nao contem': 'Nao contem',
    'Igual a': 'Igual a',
    'Diferente de': 'Diferente de',
    'Comeca com': 'Comeca com',
    'Termina com': 'Termina com',
    'Esta vazio': 'Esta vazio',
    'Nao esta vazio': 'Nao esta vazio',
    'Maior que': 'Maior que',
    'Maior ou igual': 'Maior ou igual',
    'Menor que': 'Menor que',
    'Menor ou igual': 'Menor ou igual',
    Entre: 'Entre',
    'Antes de': 'Antes de',
    'Depois de': 'Depois de',
    'Este mes': 'Este mes',
    'Este ano': 'Este ano',
    'Ultimos 7 dias': 'Ultimos 7 dias',
    'Ultimos 30 dias': 'Ultimos 30 dias',
    Sim: 'Sim',
    Nao: 'Nao',
    'Esta em': 'Esta em',
    'Nao esta em': 'Nao esta em'
  };
  return map[displayName] ?? 'Igual a';
}

function buildFallbackCatalog(): ReportMetadataFrontendCatalog {
  return {
    tables: reportTablesMetadataMock,
    categoryLabels: categoryLabelsFallback,
    relations: [],
    operatorsByType: reportFilterConditionsByType,
    operatorMetadataByType: {
      texto: [],
      numero: [],
      data: [],
      booleano: [],
      lista: []
    }
  };
}

function isDevMetadataFallbackSimulationEnabled() {
  if (typeof window === 'undefined') {
    return false;
  }
  if (!import.meta.env.DEV) {
    return false;
  }
  const search = new URLSearchParams(window.location.search);
  return search.get('simulateMetadataFallback') === '1';
}

function mapApiCatalogToFrontend(catalog: ApiMetadataCatalog): ReportMetadataFrontendCatalog {
  const fieldsByTableId = new Map<string, ApiMetadataField[]>();

  for (const field of catalog.fields) {
    const current = fieldsByTableId.get(field.tableId) ?? [];
    current.push(field);
    fieldsByTableId.set(field.tableId, current);
  }

  const tables: ReportTableMetadata[] = catalog.tables.map((table) => {
    const fields = (fieldsByTableId.get(table.id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((field) => ({
        id: getFieldIdWithinTable(field.id, table.id),
        tableId: table.id,
        name: field.displayName,
        label: field.displayName,
        technicalName: field.technicalName,
        type: toFieldType(field.dataType),
        isSelectable: field.isSelectable,
        isFilterable: field.isFilterable,
        isSortable: field.isSortable,
        isGroupable: field.isGroupable,
        isSensitive: field.isSensitive,
        maskType: field.maskType
      }));

    return {
      id: table.id,
      name: table.displayName,
      description: table.description,
      category: (table.category as ReportTableMetadata['category']) ?? 'outros',
      icon: table.icon,
      sourceId: table.sourceId,
      sortOrder: table.sortOrder,
      fields
    };
  });

  const relations: ReportMetadataRelationSuggestion[] = catalog.relations.map((relation) => ({
    id: relation.id,
    sourceTableId: relation.sourceTableId,
    sourceFieldId: getFieldIdWithinTable(relation.sourceFieldId, relation.sourceTableId),
    targetTableId: relation.targetTableId,
    targetFieldId: getFieldIdWithinTable(relation.targetFieldId, relation.targetTableId),
    relationType: relation.relationType,
    displayLabel: relation.displayLabel,
    isRequired: relation.isRequired
  }));

  const operatorsByType: Record<ReportFieldType, ReportFilterCondition[]> = {
    texto: [],
    numero: [],
    data: [],
    booleano: [],
    lista: []
  };

  const operatorMetadataByType: Record<ReportFieldType, ReportMetadataFilterOperator[]> = {
    texto: [],
    numero: [],
    data: [],
    booleano: [],
    lista: []
  };

  for (const item of catalog.filterOperators) {
    const fieldType = toFieldType(item.dataType);
    const displayName = normalizeOperatorLabel(item.displayName);
    if (!operatorsByType[fieldType].includes(displayName)) {
      operatorsByType[fieldType].push(displayName);
    }

    operatorMetadataByType[fieldType].push({
      id: item.id,
      dataType: fieldType,
      operator: item.operator,
      displayName,
      requiresValue: item.requiresValue,
      requiresSecondValue: item.requiresSecondValue,
      sortOrder: item.sortOrder
    });
  }

  for (const key of Object.keys(operatorMetadataByType) as ReportFieldType[]) {
    operatorMetadataByType[key].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const categoryLabels = { ...categoryLabelsFallback };
  for (const table of catalog.tables) {
    const category = table.category;
    if (category && !categoryLabels[category]) {
      categoryLabels[category] = category;
    }
  }

  return {
    tables,
    categoryLabels,
    relations,
    operatorsByType,
    operatorMetadataByType
  };
}

function shouldFallback(error: unknown) {
  if (!isAxiosError(error)) {
    return true;
  }
  const status = error.response?.status;
  if (!status) {
    return true;
  }
  if (status === 404 || status === 405) {
    return true;
  }
  return status >= 500;
}

export async function getReportMetadata(): Promise<ReportMetadataResult<ReportMetadataFrontendCatalog>> {
  if (isDevMetadataFallbackSimulationEnabled()) {
    return {
      data: buildFallbackCatalog(),
      mode: 'mock',
      warning: METADATA_FALLBACK_SIMULATION_WARNING
    };
  }

  try {
    const response = await api.get<ApiResponseEnvelope<ApiMetadataCatalog>>('/reports/metadata');
    return {
      data: mapApiCatalogToFrontend(response.data.data),
      mode: 'api'
    };
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }
    return {
      data: buildFallbackCatalog(),
      mode: 'mock',
      warning: METADATA_FALLBACK_WARNING
    };
  }
}

export async function getReportTables(): Promise<ReportMetadataResult<ReportTableMetadata[]>> {
  const result = await getReportMetadata();
  return {
    data: result.data.tables,
    mode: result.mode,
    warning: result.warning
  };
}

export async function getReportTableFields(tableId: string) {
  const result = await getReportMetadata();
  const table = result.data.tables.find((item) => item.id === tableId);
  return {
    data: table?.fields ?? [],
    mode: result.mode,
    warning: result.warning
  };
}

export async function getReportRelations(): Promise<ReportMetadataResult<ReportMetadataRelationSuggestion[]>> {
  const result = await getReportMetadata();
  return {
    data: result.data.relations,
    mode: result.mode,
    warning: result.warning
  };
}

export async function getReportFilterOperators(): Promise<
  ReportMetadataResult<Record<ReportFieldType, ReportMetadataFilterOperator[]>>
> {
  const result = await getReportMetadata();
  return {
    data: result.data.operatorMetadataByType,
    mode: result.mode,
    warning: result.warning
  };
}
