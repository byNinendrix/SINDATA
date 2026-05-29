export type ReportModelVisibility = 'private' | 'team' | 'public';

export interface SavedReportDefinition {
  selectedTableIds?: string[];
  selectedFieldKeys?: string[];
  selectedTables?: string[];
  selectedFields?: string[];
  tables?: string[];
  fields?: string[];
  fieldAliases?: Record<string, string>;
  manualRelations?: Array<Record<string, unknown>>;
  filters?: Array<Record<string, unknown>>;
  sorting?: Record<string, unknown>;
  grouping?: unknown;
  limit?: unknown;
  showTotals?: unknown;
  maskCpf?: unknown;
  maskName?: unknown;
  removeDuplicates?: unknown;
  tablePositions?: Record<string, { x: number; y: number }>;
  canvasZoom?: number;
  canvasOffset?: { x: number; y: number };
  showConnections?: boolean;
}

export interface SavedReportModelEntity {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: ReportModelVisibility;
  ownerUserId: number | null;
  ownerUserLogin: string;
  createdBy: string;
  updatedBy: string;
  definitionJson: SavedReportDefinition;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedReportModelSummary extends Omit<SavedReportModelEntity, 'definitionJson'> {
  summary: {
    tablesCount: number;
    fieldsCount: number;
    filtersCount: number;
    relationsCount: number;
  };
}

export interface SaveReportModelInput {
  name: string;
  description: string;
  category: string;
  visibility: ReportModelVisibility;
  definitionJson: SavedReportDefinition;
}
