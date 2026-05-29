import { isAxiosError } from 'axios';
import api from '../../../services/api';
import type {
  ReportSaveVisibility,
  SavedReportMetadata,
  SavedReportModel,
  SavedReportStorageMode
} from '../types/reportBuilder.types';

const STORAGE_KEY = 'sindata:savedReports';
const LOCAL_MODE_WARNING =
  'Nao foi possivel conectar ao servidor. O modelo sera mantido apenas neste navegador temporariamente.';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ReportBuildPayload = Omit<
  SavedReportModel,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy' | 'name' | 'description' | 'category' | 'visibility' | 'storageMode'
>;

interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiReportSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: 'private' | 'team' | 'public';
  ownerUserLogin?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  summary?: {
    tablesCount: number;
    fieldsCount: number;
    filtersCount: number;
    relationsCount: number;
  };
}

interface ApiReportDetail extends ApiReportSummary {
  definitionJson: ReportBuildPayload;
}

interface ReportStorageResult<T> {
  data: T;
  mode: SavedReportStorageMode;
  warning?: string;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStorage(): SavedReportModel[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedReportModel[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(reports: SavedReportModel[]) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function createId() {
  return `report-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function isUuid(value: string) {
  return UUID_REGEX.test(value);
}

function shouldFallbackToLocal(error: unknown) {
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

function toApiVisibility(visibility: ReportSaveVisibility): 'private' | 'team' | 'public' {
  if (visibility === 'somente_eu') {
    return 'private';
  }
  if (visibility === 'equipe') {
    return 'team';
  }
  return 'public';
}

function toFrontendVisibility(visibility: ApiReportSummary['visibility']): ReportSaveVisibility {
  if (visibility === 'private') {
    return 'somente_eu';
  }
  if (visibility === 'team') {
    return 'equipe';
  }
  return 'todos';
}

function normalizeCategory(category: string): SavedReportMetadata['category'] {
  const allowed = new Set(['geral', 'filiados', 'financeiro', 'escolas', 'atendimentos', 'personalizado']);
  return allowed.has(category) ? (category as SavedReportMetadata['category']) : 'personalizado';
}

function mapApiDetailToReport(apiReport: ApiReportDetail): SavedReportModel {
  const definition = apiReport.definitionJson;

  return {
    id: apiReport.id,
    name: apiReport.name,
    description: apiReport.description ?? '',
    category: normalizeCategory(apiReport.category),
    visibility: toFrontendVisibility(apiReport.visibility),
    status: 'ativo',
    createdBy: apiReport.createdBy ?? apiReport.ownerUserLogin ?? 'Usuario atual',
    selectedTableIds: definition.selectedTableIds ?? [],
    selectedFieldKeys: definition.selectedFieldKeys ?? [],
    fieldAliases: definition.fieldAliases ?? {},
    manualRelations: definition.manualRelations ?? [],
    filters: definition.filters ?? [],
    sorting: definition.sorting ?? {
      orderBy: '',
      orderDirection: 'asc'
    },
    grouping: definition.grouping ?? '',
    limit: definition.limit ?? '100',
    showTotals: definition.showTotals ?? false,
    maskCpf: definition.maskCpf ?? false,
    maskName: definition.maskName ?? false,
    removeDuplicates: definition.removeDuplicates ?? false,
    tablePositions: definition.tablePositions ?? {},
    canvasZoom: definition.canvasZoom ?? 1,
    canvasOffset: definition.canvasOffset ?? { x: 0, y: 0 },
    showConnections: definition.showConnections ?? true,
    summary: apiReport.summary,
    createdAt: apiReport.createdAt,
    updatedAt: apiReport.updatedAt,
    storageMode: 'api'
  };
}

function mapApiSummaryToReport(apiReport: ApiReportSummary): SavedReportModel {
  return {
    id: apiReport.id,
    name: apiReport.name,
    description: apiReport.description ?? '',
    category: normalizeCategory(apiReport.category),
    visibility: toFrontendVisibility(apiReport.visibility),
    status: 'ativo',
    createdBy: apiReport.createdBy ?? apiReport.ownerUserLogin ?? 'Usuario atual',
    selectedTableIds: [],
    selectedFieldKeys: [],
    fieldAliases: {},
    manualRelations: [],
    filters: [],
    sorting: {
      orderBy: '',
      orderDirection: 'asc'
    },
    grouping: '',
    limit: '100',
    showTotals: false,
    maskCpf: false,
    maskName: false,
    removeDuplicates: false,
    tablePositions: {},
    canvasZoom: 1,
    canvasOffset: { x: 0, y: 0 },
    showConnections: true,
    summary: {
      tablesCount: apiReport.summary?.tablesCount ?? 0,
      fieldsCount: apiReport.summary?.fieldsCount ?? 0,
      filtersCount: apiReport.summary?.filtersCount ?? 0,
      relationsCount: apiReport.summary?.relationsCount ?? 0
    },
    createdAt: apiReport.createdAt,
    updatedAt: apiReport.updatedAt,
    storageMode: 'api'
  };
}

function upsertLocalReport(report: SavedReportModel) {
  const reports = readStorage();
  const index = reports.findIndex((item) => item.id === report.id);
  if (index >= 0) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  writeStorage(reports);
}

function createLocalReport(payload: ReportBuildPayload, metadata: SavedReportMetadata): SavedReportModel {
  const now = new Date().toISOString();
  return {
    id: createId(),
    status: 'ativo',
    createdBy: 'Usuario atual',
    createdAt: now,
    updatedAt: now,
    name: metadata.name.trim(),
    description: metadata.description.trim(),
    category: metadata.category,
    visibility: metadata.visibility,
    ...payload,
    storageMode: 'local'
  };
}

async function saveReportApi(payload: ReportBuildPayload, metadata: SavedReportMetadata) {
  const response = await api.post<ApiResponseEnvelope<ApiReportDetail>>('/reports/models', {
    name: metadata.name.trim(),
    description: metadata.description.trim(),
    category: metadata.category,
    visibility: toApiVisibility(metadata.visibility),
    definitionJson: payload
  });
  return mapApiDetailToReport(response.data.data);
}

async function updateReportApi(id: string, payload: ReportBuildPayload, metadata: SavedReportMetadata) {
  const response = await api.put<ApiResponseEnvelope<ApiReportDetail>>(`/reports/models/${id}`, {
    name: metadata.name.trim(),
    description: metadata.description.trim(),
    category: metadata.category,
    visibility: toApiVisibility(metadata.visibility),
    definitionJson: payload
  });
  return mapApiDetailToReport(response.data.data);
}

export async function getSavedReports(): Promise<
  ReportStorageResult<{ reports: SavedReportModel[]; hasLocalModels: boolean }>
> {
  try {
    const response = await api.get<ApiResponseEnvelope<ApiReportSummary[]>>('/reports/models');
    const reports = response.data.data.map((item) => mapApiSummaryToReport(item));
    const hasLocalModels = readStorage().length > 0;
    return {
      data: {
        reports,
        hasLocalModels
      },
      mode: 'api'
    };
  } catch (error) {
    if (!shouldFallbackToLocal(error)) {
      throw error;
    }

    return {
      data: {
        reports: readStorage().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
        hasLocalModels: false
      },
      mode: 'local',
      warning: LOCAL_MODE_WARNING
    };
  }
}

export async function getSavedReportById(id: string): Promise<ReportStorageResult<SavedReportModel | null>> {
  if (!isUuid(id)) {
    return {
      data: readStorage().find((item) => item.id === id) ?? null,
      mode: 'local'
    };
  }

  try {
    const response = await api.get<ApiResponseEnvelope<ApiReportDetail>>(`/reports/models/${id}`);
    return {
      data: mapApiDetailToReport(response.data.data),
      mode: 'api'
    };
  } catch (error) {
    if (!shouldFallbackToLocal(error)) {
      throw error;
    }

    return {
      data: readStorage().find((item) => item.id === id) ?? null,
      mode: 'local',
      warning: LOCAL_MODE_WARNING
    };
  }
}

export async function saveReport(
  payload: ReportBuildPayload,
  metadata: SavedReportMetadata
): Promise<ReportStorageResult<SavedReportModel | null>> {
  try {
    const report = await saveReportApi(payload, metadata);
    return { data: report, mode: 'api' };
  } catch (error) {
    if (!shouldFallbackToLocal(error)) {
      throw error;
    }

    const report = createLocalReport(payload, metadata);
    upsertLocalReport(report);
    return {
      data: report,
      mode: 'local',
      warning: LOCAL_MODE_WARNING
    };
  }
}

export async function updateReport(
  id: string,
  payload: ReportBuildPayload,
  metadata: SavedReportMetadata
): Promise<ReportStorageResult<SavedReportModel | null>> {
  if (!isUuid(id)) {
    const reports = readStorage();
    const index = reports.findIndex((item) => item.id === id);
    if (index < 0) {
      return {
        data: null,
        mode: 'local'
      };
    }

    const current = reports[index];
    const next: SavedReportModel = {
      ...current,
      ...payload,
      name: metadata.name.trim(),
      description: metadata.description.trim(),
      category: metadata.category,
      visibility: metadata.visibility,
      updatedAt: new Date().toISOString(),
      storageMode: 'local'
    };
    reports[index] = next;
    writeStorage(reports);

    return {
      data: next,
      mode: 'local'
    };
  }

  try {
    const report = await updateReportApi(id, payload, metadata);
    return { data: report, mode: 'api' };
  } catch (error) {
    if (!shouldFallbackToLocal(error)) {
      throw error;
    }

    const reports = readStorage();
    const index = reports.findIndex((item) => item.id === id);
    if (index < 0) {
      const created = createLocalReport(payload, metadata);
      created.id = id;
      upsertLocalReport(created);
      return {
        data: created,
        mode: 'local',
        warning: LOCAL_MODE_WARNING
      };
    }

    const current = reports[index];
    const next: SavedReportModel = {
      ...current,
      ...payload,
      name: metadata.name.trim(),
      description: metadata.description.trim(),
      category: metadata.category,
      visibility: metadata.visibility,
      updatedAt: new Date().toISOString(),
      storageMode: 'local'
    };
    reports[index] = next;
    writeStorage(reports);

    return {
      data: next,
      mode: 'local',
      warning: LOCAL_MODE_WARNING
    };
  }
}

export async function duplicateReport(id: string): Promise<ReportStorageResult<SavedReportModel | null>> {
  if (!isUuid(id)) {
    const reports = readStorage();
    const source = reports.find((item) => item.id === id);
    if (!source) {
      return {
        data: null,
        mode: 'local'
      };
    }

    const now = new Date().toISOString();
    const clone: SavedReportModel = {
      ...source,
      id: createId(),
      name: `Copia de ${source.name}`,
      createdAt: now,
      updatedAt: now,
      storageMode: 'local'
    };

    reports.push(clone);
    writeStorage(reports);

    return {
      data: clone,
      mode: 'local'
    };
  }

  try {
    const response = await api.post<ApiResponseEnvelope<ApiReportDetail>>(`/reports/models/${id}/duplicate`, {});
    return {
      data: mapApiDetailToReport(response.data.data),
      mode: 'api'
    };
  } catch (error) {
    if (!shouldFallbackToLocal(error)) {
      throw error;
    }

    const reports = readStorage();
    const source = reports.find((item) => item.id === id);
    if (!source) {
      return {
        data: null,
        mode: 'local',
        warning: LOCAL_MODE_WARNING
      };
    }

    const now = new Date().toISOString();
    const clone: SavedReportModel = {
      ...source,
      id: createId(),
      name: `Copia de ${source.name}`,
      createdAt: now,
      updatedAt: now,
      storageMode: 'local'
    };

    reports.push(clone);
    writeStorage(reports);

    return {
      data: clone,
      mode: 'local',
      warning: LOCAL_MODE_WARNING
    };
  }
}

export async function deleteReport(id: string): Promise<ReportStorageResult<boolean>> {
  if (!isUuid(id)) {
    const reports = readStorage();
    const next = reports.filter((item) => item.id !== id);
    writeStorage(next);
    return {
      data: true,
      mode: 'local'
    };
  }

  try {
    await api.delete<ApiResponseEnvelope<{ id: string }>>(`/reports/models/${id}`);
    return {
      data: true,
      mode: 'api'
    };
  } catch (error) {
    if (!shouldFallbackToLocal(error)) {
      throw error;
    }

    const reports = readStorage();
    const next = reports.filter((item) => item.id !== id);
    writeStorage(next);
    return {
      data: true,
      mode: 'local',
      warning: LOCAL_MODE_WARNING
    };
  }
}
