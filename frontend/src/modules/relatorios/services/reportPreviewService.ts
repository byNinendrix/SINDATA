import { isAxiosError } from 'axios';
import api from '../../../services/api';
import { reportPreviewMock } from '../mocks/reportBuilderMocks';

type PreviewDataType = 'text' | 'number' | 'date' | 'boolean' | 'option';
type PreviewMaskType = 'none' | 'cpf' | 'name' | 'currency' | 'date';

interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReportPreviewRequestField {
  fieldId: string;
  alias?: string;
  label?: string;
  dataType?: PreviewDataType;
  isSensitive?: boolean;
  maskType?: PreviewMaskType;
}

export interface ReportPreviewRequestRelation {
  sourceFieldId: string;
  targetFieldId: string;
  operator: 'equals';
}

export interface ReportPreviewRequestFilter {
  fieldId: string;
  operator: string;
  value?: string | number | boolean | Array<string | number>;
  secondValue?: string | number;
  logicalConnector?: 'AND' | 'OR';
}

export interface ReportPreviewRequestPayload {
  selectedTables: string[];
  selectedFields: ReportPreviewRequestField[];
  relations?: ReportPreviewRequestRelation[];
  filters?: ReportPreviewRequestFilter[];
  settings?: {
    orderByFieldId?: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
    page?: number;
    pageSize?: number;
    maskCpf?: boolean;
    maskName?: boolean;
    removeDuplicates?: boolean;
  };
  reportModelId?: string;
}

export interface ReportPreviewResponseData {
  columns: Array<{
    fieldId: string;
    label: string;
    dataType: PreviewDataType;
    isSensitive: boolean;
    maskType: PreviewMaskType;
    masked?: boolean;
  }>;
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

export interface ReportPreviewResult {
  mode: 'api' | 'mock';
  data: ReportPreviewResponseData;
  warning?: string;
}

const PREVIEW_FALLBACK_WARNING = 'Nao foi possivel gerar a previa real. Exibindo previa local temporaria.';

function isDevPreviewFallbackSimulationEnabled() {
  if (typeof window === 'undefined') {
    return false;
  }
  if (!import.meta.env.DEV) {
    return false;
  }
  const search = new URLSearchParams(window.location.search);
  return search.get('simulatePreviewFallback') === '1';
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

function maskCpfValue(value: unknown): string {
  const raw = String(value ?? '');
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 11) {
    return raw;
  }
  return `***.***.***-${digits.slice(-2)}`;
}

function maskNameValue(value: unknown): string {
  const raw = String(value ?? '').trim();
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

function resolveCellValue(
  row: Record<string, unknown>,
  fieldId: string,
  maskType: PreviewMaskType,
  maskCpf: boolean,
  maskName: boolean
): unknown {
  const fallback = row[fieldId];
  const value = fallback ?? '-';
  if (maskType === 'cpf' && maskCpf) {
    return maskCpfValue(value);
  }
  if (maskType === 'name' && maskName) {
    return maskNameValue(value);
  }
  return value;
}

function buildMockPreview(payload: ReportPreviewRequestPayload): ReportPreviewResponseData {
  const page = Math.max(1, Number(payload.settings?.page ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(payload.settings?.pageSize ?? payload.settings?.limit ?? 50) || 50));
  const offset = (page - 1) * pageSize;
  const maskCpf = Boolean(payload.settings?.maskCpf);
  const maskName = Boolean(payload.settings?.maskName);

  const columns = payload.selectedFields.map((field) => ({
    fieldId: field.fieldId,
    label: field.alias?.trim() || field.label?.trim() || field.fieldId,
    dataType: field.dataType ?? 'text',
    isSensitive: Boolean(field.isSensitive),
    maskType: field.maskType ?? 'none'
  }));

  const sourceRows = reportPreviewMock.slice(offset, offset + pageSize + 1);
  const hasMore = sourceRows.length > pageSize;
  const limitedRows = hasMore ? sourceRows.slice(0, pageSize) : sourceRows;

  const rows = limitedRows.map((row) => {
    const next: Record<string, unknown> = {};
    columns.forEach((column) => {
      next[column.label] = resolveCellValue(row, column.fieldId, column.maskType, maskCpf, maskName);
    });
    return next;
  });

  return {
    columns,
    rows,
    pagination: {
      page,
      pageSize,
      rowsReturned: rows.length,
      hasMore
    },
    summary: {
      tablesCount: payload.selectedTables.length,
      fieldsCount: payload.selectedFields.length,
      filtersCount: payload.filters?.length ?? 0,
      relationsCount: payload.relations?.length ?? 0,
      executionTimeMs: 0
    },
    warnings: ['Previa local temporaria em uso.']
  };
}

export async function previewReport(payload: ReportPreviewRequestPayload): Promise<ReportPreviewResult> {
  if (isDevPreviewFallbackSimulationEnabled()) {
    return {
      mode: 'mock',
      data: buildMockPreview(payload),
      warning: PREVIEW_FALLBACK_WARNING
    };
  }

  const apiPayload = {
    selectedTables: payload.selectedTables,
    selectedFields: payload.selectedFields.map((field) => ({
      fieldId: field.fieldId,
      alias: field.alias
    })),
    relations: payload.relations ?? [],
    filters: payload.filters ?? [],
    settings: payload.settings,
    reportModelId: payload.reportModelId
  };

  try {
    const response = await api.post<ApiResponseEnvelope<ReportPreviewResponseData>>('/reports/preview', apiPayload);
    return {
      mode: 'api',
      data: response.data.data
    };
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }

    return {
      mode: 'mock',
      data: buildMockPreview(payload),
      warning: PREVIEW_FALLBACK_WARNING
    };
  }
}
