export type ReportMetadataFieldDataType = 'text' | 'number' | 'date' | 'boolean' | 'option';
export type ReportMetadataMaskType = 'none' | 'cpf' | 'name' | 'currency' | 'date';

export interface ReportMetadataDataSource {
  id: string;
  name: string;
  description: string;
}

export interface ReportMetadataTable {
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

export interface ReportMetadataField {
  id: string;
  tableId: string;
  technicalName: string;
  displayName: string;
  description: string;
  dataType: ReportMetadataFieldDataType;
  isSelectable: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  isGroupable: boolean;
  isSensitive: boolean;
  maskType: ReportMetadataMaskType;
  sortOrder: number;
}

export interface ReportMetadataRelation {
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
  dataType: ReportMetadataFieldDataType;
  operator: string;
  displayName: string;
  requiresValue: boolean;
  requiresSecondValue: boolean;
  sortOrder: number;
}

export interface ReportMetadataCatalog {
  dataSources: ReportMetadataDataSource[];
  tables: ReportMetadataTable[];
  fields: ReportMetadataField[];
  relations: ReportMetadataRelation[];
  filterOperators: ReportMetadataFilterOperator[];
}
