import api from '../../../services/api';
import type { ReportFilterRule, ReportManualRelation } from '../types/reportBuilder.types';

interface PreviewFilterPayload {
  tableId: string;
  fieldId: string;
  condition: 'Igual a' | 'Diferente de' | 'Contem' | 'Maior que' | 'Menor que' | 'Entre';
  value: string;
  secondValue?: string;
}

export interface ReportPreviewRequestPayload {
  selectedTableIds: string[];
  selectedFieldKeys: string[];
  manualRelations: ReportManualRelation[];
  filters: ReportFilterRule[];
  limit?: number;
  orderBy?: string;
}

export interface ReportPreviewResponseData {
  rows: Array<Record<string, unknown>>;
  source: 'database';
  appliedLimit: number;
}

function toPreviewCondition(condition: string): PreviewFilterPayload['condition'] | null {
  if (
    condition === 'Igual a' ||
    condition === 'Diferente de' ||
    condition === 'Contem' ||
    condition === 'Maior que' ||
    condition === 'Menor que' ||
    condition === 'Entre'
  ) {
    return condition;
  }
  return null;
}

export async function fetchRealReportPreview(payload: ReportPreviewRequestPayload) {
  const previewFilters: PreviewFilterPayload[] = payload.filters.reduce<PreviewFilterPayload[]>(
    (acc, filter) => {
      const mappedCondition = toPreviewCondition(filter.condition);
      if (!mappedCondition) {
        return acc;
      }
      acc.push({
        tableId: filter.tableId,
        fieldId: filter.fieldId,
        condition: mappedCondition,
        value: filter.value,
        secondValue: filter.secondValue
      });
      return acc;
    },
    []
  );

  const response = await api.post<{ data: ReportPreviewResponseData }>('/relatorios/preview', {
    selectedTableIds: payload.selectedTableIds,
    selectedFieldKeys: payload.selectedFieldKeys,
    manualRelations: payload.manualRelations,
    filters: previewFilters,
    limit: payload.limit,
    orderBy: payload.orderBy
  });

  return response.data.data;
}
