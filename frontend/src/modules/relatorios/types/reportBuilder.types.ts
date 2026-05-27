export interface ReportTableOption {
  id: string;
  label: string;
  description: string;
}

export interface ReportFieldOption {
  id: string;
  tableId?: string;
  name?: string;
  label: string;
  type?: string;
  selected?: boolean;
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
  fields: ReportFieldOption[];
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
  tableId: string;
  fieldId: string;
  condition: string;
  value: string;
  secondValue?: string;
}

export interface ReportBuilderConfig {
  orderBy: string;
  groupBy: string;
  limit: string;
  showTotals: boolean;
  maskCpf: boolean;
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
