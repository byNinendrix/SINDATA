export interface ReportTableOption {
  id: string;
  label: string;
  description: string;
  category?: ReportTableCategory;
}

export interface ReportFieldOption {
  id: string;
  tableId?: string;
  name?: string;
  label: string;
  type?: ReportFieldType;
  selected?: boolean;
  listOptions?: Array<{ value: string; label: string }>;
  technicalName?: string;
  isSelectable?: boolean;
  isFilterable?: boolean;
  isSortable?: boolean;
  isGroupable?: boolean;
  isSensitive?: boolean;
  maskType?: 'none' | 'cpf' | 'name' | 'currency' | 'date';
}

export interface ReportRelationOption {
  id?: string;
  fromTableId?: string;
  toTableId?: string;
  fromTable?: string;
  toTable?: string;
  label: string;
  requiredTable?: string;
  fromFieldLabel?: string;
  toFieldLabel?: string;
  requiredFromFieldLabel?: string;
  requiredToFieldLabel?: string;
}

export interface ReportTableMetadata {
  id: string;
  name: string;
  description: string;
  category?: ReportTableCategory;
  icon?: string;
  sourceId?: string;
  sortOrder?: number;
  fields: ReportFieldOption[];
}

export interface ReportMetadataRelationSuggestion {
  id: string;
  sourceTableId: string;
  sourceFieldId: string;
  targetTableId: string;
  targetFieldId: string;
  relationType: 'equals';
  displayLabel: string;
  isRequired: boolean;
}

export interface ReportMetadataFilterOperator {
  id: string;
  dataType: ReportFieldType;
  operator: string;
  displayName: ReportFilterCondition;
  requiresValue: boolean;
  requiresSecondValue: boolean;
  sortOrder: number;
}

export interface ReportFiltersState {
  regional: string;
  municipio: string;
  situacao: string;
  periodoInicio: string;
  periodoFim: string;
}

export interface ReportFilterRule {
  id: string;
  connector?: ReportFilterConnector;
  tableId: string;
  fieldId: string;
  fieldType?: ReportFieldType;
  condition: ReportFilterCondition | string;
  value: string;
  secondValue?: string;
}

export interface ReportBuilderConfig {
  orderBy: string;
  orderDirection: 'asc' | 'desc';
  groupBy: string;
  limit: string;
  showTotals: boolean;
  maskCpf: boolean;
  maskName: boolean;
  removeDuplicates: boolean;
}

export interface ReportManualRelation {
  id: string;
  sourceTableId: string;
  sourceFieldId: string;
  targetTableId: string;
  targetFieldId: string;
  operator: 'equals';
}

export interface ReportManualRelationDraft {
  sourceTableId: string;
  sourceFieldId: string;
  targetTableId: string;
  targetFieldId: string;
  operator: 'equals';
}

export type ReportTableCategory =
  | 'pessoas_filiacoes'
  | 'estrutura_sindical'
  | 'local_trabalho'
  | 'financeiro'
  | 'atendimentos'
  | 'outros';

export type ReportFieldType = 'texto' | 'numero' | 'data' | 'booleano' | 'lista';

export type ReportFilterConnector = 'E' | 'OU';

export type ReportFilterCondition =
  | 'Contem'
  | 'Nao contem'
  | 'Igual a'
  | 'Diferente de'
  | 'Comeca com'
  | 'Termina com'
  | 'Esta vazio'
  | 'Nao esta vazio'
  | 'Maior que'
  | 'Maior ou igual'
  | 'Menor que'
  | 'Menor ou igual'
  | 'Entre'
  | 'Antes de'
  | 'Depois de'
  | 'Este mes'
  | 'Este ano'
  | 'Ultimos 7 dias'
  | 'Ultimos 30 dias'
  | 'Sim'
  | 'Nao'
  | 'Esta em'
  | 'Nao esta em';

export interface ReportFilterDraftState {
  connector: ReportFilterConnector;
  tableId: string;
  fieldId: string;
  fieldType: ReportFieldType;
  condition: ReportFilterCondition | '';
  value: string;
  secondValue?: string;
}

export interface ReportCanvasLayoutState {
  tablePositions: Record<string, { x: number; y: number }>;
  canvasZoom: number;
  canvasOffset: { x: number; y: number };
  showConnections: boolean;
}

export interface SavedReportMetadata {
  name: string;
  description: string;
  category: ReportSaveCategory;
  visibility: ReportSaveVisibility;
}

export type ReportSaveCategory = 'geral' | 'filiados' | 'financeiro' | 'escolas' | 'atendimentos' | 'personalizado';

export type ReportSaveVisibility = 'somente_eu' | 'equipe' | 'todos';
export type SavedReportStorageMode = 'api' | 'local';

export interface SavedReportModel {
  id: string;
  name: string;
  description: string;
  category: ReportSaveCategory;
  visibility: ReportSaveVisibility;
  status: 'ativo' | 'rascunho';
  createdBy: string;
  selectedTableIds: string[];
  selectedFieldKeys: string[];
  fieldAliases: Record<string, string>;
  manualRelations: ReportManualRelation[];
  filters: ReportFilterRule[];
  sorting: {
    orderBy: string;
    orderDirection: 'asc' | 'desc';
  };
  grouping: string;
  limit: string;
  showTotals: boolean;
  maskCpf: boolean;
  maskName: boolean;
  removeDuplicates: boolean;
  tablePositions: Record<string, { x: number; y: number }>;
  canvasZoom: number;
  canvasOffset: { x: number; y: number };
  showConnections: boolean;
  summary?: {
    tablesCount: number;
    fieldsCount: number;
    filtersCount: number;
    relationsCount: number;
  };
  createdAt: string;
  updatedAt: string;
  storageMode?: SavedReportStorageMode;
}
