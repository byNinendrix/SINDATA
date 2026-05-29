export interface ReportPreviewSelectedFieldPayload {
  fieldId: string;
  alias?: string;
}

export interface ReportPreviewRelationPayload {
  sourceFieldId: string;
  targetFieldId: string;
  operator: 'equals';
}

export interface ReportPreviewFilterPayload {
  fieldId: string;
  operator: string;
  value?: string | number | boolean | Array<string | number>;
  secondValue?: string | number;
  logicalConnector?: 'AND' | 'OR';
}

export interface ReportPreviewSettingsPayload {
  orderByFieldId?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  page?: number;
  pageSize?: number;
  maskCpf?: boolean;
  maskName?: boolean;
  removeDuplicates?: boolean;
}

export interface ReportPreviewRequestPayload {
  selectedTables: string[];
  selectedFields: ReportPreviewSelectedFieldPayload[];
  relations?: ReportPreviewRelationPayload[];
  filters?: ReportPreviewFilterPayload[];
  settings?: ReportPreviewSettingsPayload;
  reportModelId?: string;
}

export interface ReportPreviewColumnResponse {
  fieldId: string;
  label: string;
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'option';
  isSensitive: boolean;
  maskType: 'none' | 'cpf' | 'name' | 'currency' | 'date';
  masked?: boolean;
}

export interface ReportPreviewResponse {
  columns: ReportPreviewColumnResponse[];
  rows: Array<Record<string, unknown>>;
  pagination: {
    page: number;
    pageSize: number;
    rowsReturned: number;
    hasMore: boolean;
  };
  summary: {
    tablesCount: number;
    fieldsCount: number;
    filtersCount: number;
    relationsCount: number;
    executionTimeMs: number;
  };
  warnings: string[];
}
