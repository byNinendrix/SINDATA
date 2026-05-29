import { FolderOpen, PlusCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AvailableTablesPanel } from '../components/AvailableTablesPanel';
import { ReportBuilderActions } from '../components/ReportBuilderActions';
import { ReportCanvas } from '../components/ReportCanvas';
import { ReportFiltersPanel } from '../components/ReportFiltersPanel';
import { ReportPreviewTable } from '../components/ReportPreviewTable';
import { SaveReportModal } from '../components/SaveReportModal';
import { SelectedFieldsPanel } from '../components/SelectedFieldsPanel';
import {
  initialReportConfig,
  initialReportFilterDraft,
  reportFilterConditionsByType,
  reportTableCategoryLabels,
  reportTablesMetadataMock
} from '../mocks/reportBuilderMocks';
import { getReportMetadata } from '../services/reportMetadataService';
import { previewReport } from '../services/reportPreviewService';
import { getSavedReportById, saveReport, updateReport } from '../services/reportStorageService';
import type {
  ReportBuilderConfig,
  ReportCanvasLayoutState,
  ReportFieldType,
  ReportFilterCondition,
  ReportFilterRule,
  ReportMetadataFilterOperator,
  ReportMetadataRelationSuggestion,
  ReportManualRelation,
  ReportTableMetadata,
  SavedReportMetadata
} from '../types/reportBuilder.types';

interface FeedbackState {
  type: 'success' | 'info';
  message: string;
}

interface ReportFieldDragData {
  tableId: string;
  fieldId: string;
}

function createEmptyCanvasLayout(): ReportCanvasLayoutState {
  return {
    tablePositions: {},
    canvasZoom: 1,
    canvasOffset: { x: 0, y: 0 },
    showConnections: true
  };
}

function isNoValueCondition(condition: string) {
  return (
    condition === 'Esta vazio' ||
    condition === 'Nao esta vazio' ||
    condition === 'Este mes' ||
    condition === 'Este ano' ||
    condition === 'Ultimos 7 dias' ||
    condition === 'Ultimos 30 dias' ||
    condition === 'Sim' ||
    condition === 'Nao'
  );
}

function isRangeCondition(condition: string) {
  return condition === 'Entre';
}

function mapFallbackConditionToOperator(condition: string): string {
  const map: Record<string, string> = {
    Contem: 'contains',
    'Nao contem': 'not_contains',
    'Igual a': 'equals',
    'Diferente de': 'not_equals',
    'Comeca com': 'starts_with',
    'Termina com': 'ends_with',
    'Esta vazio': 'is_empty',
    'Nao esta vazio': 'is_not_empty',
    'Maior que': 'greater_than',
    'Maior ou igual': 'greater_or_equal',
    'Menor que': 'less_than',
    'Menor ou igual': 'less_or_equal',
    Entre: 'between',
    'Antes de': 'before',
    'Depois de': 'after',
    'Este mes': 'current_month',
    'Este ano': 'current_year',
    'Ultimos 7 dias': 'last_7_days',
    'Ultimos 30 dias': 'last_30_days',
    Sim: 'is_true',
    Nao: 'is_false',
    'Esta em': 'in',
    'Nao esta em': 'not_in'
  };
  return map[condition] ?? 'equals';
}

export function ReportBuilderPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const modelIdParam = searchParams.get('modelId') ?? '';
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>([]);
  const [fieldAliases, setFieldAliases] = useState<Record<string, string>>({});
  const [manualRelations, setManualRelations] = useState<ReportManualRelation[]>([]);
  const [filters, setFilters] = useState<ReportFilterRule[]>([]);
  const [filterDraft, setFilterDraft] = useState(initialReportFilterDraft);
  const [config, setConfig] = useState<ReportBuilderConfig>(initialReportConfig);
  const [canvasLayout, setCanvasLayout] = useState<ReportCanvasLayoutState>(createEmptyCanvasLayout());
  const [previewRows, setPreviewRows] = useState<Array<Record<string, unknown>>>([]);
  const [previewColumns, setPreviewColumns] = useState<
    Array<{
      fieldId: string;
      label: string;
      dataType: 'text' | 'number' | 'date' | 'boolean' | 'option';
      isSensitive: boolean;
      maskType: 'none' | 'cpf' | 'name' | 'currency' | 'date';
      masked?: boolean;
    }>
  >([]);
  const [previewWarning, setPreviewWarning] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSource, setPreviewSource] = useState<'mock' | 'database'>('database');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savingModel, setSavingModel] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [saveInitialData, setSaveInitialData] = useState<SavedReportMetadata | null>(null);
  const [canvasLayoutSyncKey, setCanvasLayoutSyncKey] = useState(0);
  const [tablesMetadata, setTablesMetadata] = useState<ReportTableMetadata[]>(reportTablesMetadataMock);
  const [tableCategoryLabels, setTableCategoryLabels] = useState<Record<string, string>>(reportTableCategoryLabels);
  const [metadataRelations, setMetadataRelations] = useState<ReportMetadataRelationSuggestion[]>([]);
  const [filterConditionsByType, setFilterConditionsByType] = useState<Record<ReportFieldType, ReportFilterCondition[]>>(
    reportFilterConditionsByType
  );
  const [filterOperatorMetadataByType, setFilterOperatorMetadataByType] = useState<
    Record<ReportFieldType, ReportMetadataFilterOperator[]>
  >({
    texto: [],
    numero: [],
    data: [],
    booleano: [],
    lista: []
  });
  const [metadataReady, setMetadataReady] = useState(false);

  const tableMap = useMemo(() => {
    return new Map(tablesMetadata.map((table) => [table.id, table]));
  }, [tablesMetadata]);

  useEffect(() => {
    let cancelled = false;

    async function loadMetadata() {
      try {
        const result = await getReportMetadata();
        if (cancelled) {
          return;
        }

        setTablesMetadata(result.data.tables);
        setTableCategoryLabels(result.data.categoryLabels);
        setMetadataRelations(result.data.relations);
        setFilterConditionsByType(result.data.operatorsByType);
        setFilterOperatorMetadataByType(result.data.operatorMetadataByType);
        setMetadataReady(true);

        if (result.warning) {
          setFeedback({ type: 'info', message: result.warning });
        }
      } catch {
        if (!cancelled) {
          setMetadataReady(true);
          setFeedback({
            type: 'info',
            message: 'Nao foi possivel carregar metadados do servidor. Usando catalogo local temporario.'
          });
        }
      }
    }

    void loadMetadata();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTables = useMemo(() => {
    return selectedTableIds
      .map((tableId) => tableMap.get(tableId))
      .filter((table): table is NonNullable<typeof table> => Boolean(table));
  }, [selectedTableIds, tableMap]);

  const selectableFieldKeys = useMemo(() => {
    return selectedTables.flatMap((table) =>
      table.fields
        .filter((field) => field.isSelectable !== false)
        .map((field) => `${table.id}.${field.id}`)
    );
  }, [selectedTables]);

  const sortableFieldKeys = useMemo(() => {
    return selectedTables.flatMap((table) =>
      table.fields
        .filter((field) => field.isSortable !== false && field.isSelectable !== false)
        .map((field) => `${table.id}.${field.id}`)
    );
  }, [selectedTables]);

  const groupableFieldKeys = useMemo(() => {
    return selectedTables.flatMap((table) =>
      table.fields
        .filter((field) => field.isGroupable !== false && field.isSelectable !== false)
        .map((field) => `${table.id}.${field.id}`)
    );
  }, [selectedTables]);

  useEffect(() => {
    const availableSet = new Set(selectableFieldKeys);
    const sortableSet = new Set(sortableFieldKeys);
    const groupableSet = new Set(groupableFieldKeys);
    setSelectedFieldKeys((current) => current.filter((fieldKey) => availableSet.has(fieldKey)));
    setFieldAliases((current) => {
      const next: Record<string, string> = {};
      for (const [key, value] of Object.entries(current)) {
        if (availableSet.has(key)) {
          next[key] = value;
        }
      }
      return next;
    });
    setFilters((current) => current.filter((filter) => selectedTableIds.includes(filter.tableId)));
    setConfig((current) => ({
      ...current,
      orderBy: sortableSet.has(current.orderBy) ? current.orderBy : '',
      groupBy: groupableSet.has(current.groupBy) ? current.groupBy : ''
    }));
    setFilterDraft((current) => {
      if (!current.tableId || selectedTableIds.includes(current.tableId)) {
        return current;
      }
      return { ...current, tableId: '', fieldId: '' };
    });
    setManualRelations((current) =>
      current.filter(
        (relation) =>
          selectedTableIds.includes(relation.sourceTableId) && selectedTableIds.includes(relation.targetTableId)
      )
    );
  }, [groupableFieldKeys, selectableFieldKeys, selectedTableIds, sortableFieldKeys]);

  useEffect(() => {
    if (!metadataReady) {
      return;
    }

    if (!modelIdParam) {
      return;
    }

    let cancelled = false;

    async function loadSavedModel() {
      try {
        const result = await getSavedReportById(modelIdParam);
        const savedReport = result.data;
        if (cancelled) {
          return;
        }

        if (!savedReport) {
          setFeedback({ type: 'info', message: 'Modelo informado nao foi encontrado.' });
          return;
        }

        const missingTables = savedReport.selectedTableIds.filter((tableId) => !tableMap.has(tableId));
        const missingFields = savedReport.selectedFieldKeys.filter((fieldKey) => {
          const [tableId, fieldId] = fieldKey.split('.');
          const table = tableMap.get(tableId);
          return !table?.fields.some((field) => field.id === fieldId);
        });

        setSelectedTableIds(savedReport.selectedTableIds);
        setSelectedFieldKeys(savedReport.selectedFieldKeys);
        setFieldAliases(savedReport.fieldAliases ?? {});
        setManualRelations(savedReport.manualRelations ?? []);
        setFilters(savedReport.filters ?? []);
        setConfig({
          orderBy: savedReport.sorting.orderBy,
          orderDirection: savedReport.sorting.orderDirection,
          groupBy: savedReport.grouping,
          limit: savedReport.limit,
          showTotals: savedReport.showTotals,
          maskCpf: savedReport.maskCpf,
          maskName: savedReport.maskName ?? false,
          removeDuplicates: savedReport.removeDuplicates
        });
        setCanvasLayout({
          tablePositions: savedReport.tablePositions ?? {},
          canvasZoom: savedReport.canvasZoom ?? 1,
          canvasOffset: savedReport.canvasOffset ?? { x: 0, y: 0 },
          showConnections: savedReport.showConnections ?? true
        });
        setCanvasLayoutSyncKey((current) => current + 1);
        setEditingReportId(savedReport.id);
        setSaveInitialData({
          name: savedReport.name,
          description: savedReport.description,
          category: savedReport.category,
          visibility: savedReport.visibility
        });
        setFeedback({
          type: 'info',
          message:
            missingTables.length > 0 || missingFields.length > 0
              ? `Modelo carregado: ${savedReport.name}. Alguns campos deste relatorio nao estao mais disponiveis no catalogo atual.`
              : result.mode === 'local'
                ? 'Modelo carregado em modo local temporario.'
                : `Modelo carregado: ${savedReport.name}.`
        });
      } catch {
        if (!cancelled) {
          setFeedback({ type: 'info', message: 'Nao foi possivel carregar o modelo informado.' });
        }
      }
    }

    void loadSavedModel();

    return () => {
      cancelled = true;
    };
  }, [metadataReady, modelIdParam, tableMap]);

  function clearBuilder(message = 'Construcao do relatorio limpa com sucesso.') {
    setSelectedTableIds([]);
    setSelectedFieldKeys([]);
    setFieldAliases({});
    setManualRelations([]);
    setFilters([]);
    setFilterDraft(initialReportFilterDraft);
    setConfig(initialReportConfig);
    setCanvasLayout(createEmptyCanvasLayout());
    setCanvasLayoutSyncKey((current) => current + 1);
    setPreviewRows([]);
    setPreviewColumns([]);
    setPreviewWarning('');
    setPreviewSource('database');
    setEditingReportId(null);
    setSaveInitialData(null);
    setSearchParams({});
    setFeedback({ type: 'success', message });
  }

  const handleCanvasLayoutChange = useCallback((next: ReportCanvasLayoutState) => {
    setCanvasLayout((current) => {
      const sameZoom = current.canvasZoom === next.canvasZoom;
      const sameOffset = current.canvasOffset.x === next.canvasOffset.x && current.canvasOffset.y === next.canvasOffset.y;
      const sameShow = current.showConnections === next.showConnections;

      const currentKeys = Object.keys(current.tablePositions);
      const nextKeys = Object.keys(next.tablePositions);
      if (!sameZoom || !sameOffset || !sameShow || currentKeys.length !== nextKeys.length) {
        return next;
      }

      for (const key of nextKeys) {
        const currentPos = current.tablePositions[key];
        const nextPos = next.tablePositions[key];
        if (!currentPos || !nextPos || currentPos.x !== nextPos.x || currentPos.y !== nextPos.y) {
          return next;
        }
      }

      return current;
    });
  }, []);

  function handleClearWithConfirmation() {
    const confirmed = window.confirm(
      'Deseja limpar toda a construcao atual?\nEssa acao removera tabelas, campos, ligacoes e filtros desta tela.'
    );
    if (!confirmed) {
      return;
    }
    clearBuilder();
  }

  function toggleTable(tableId: string) {
    setSelectedTableIds((current) =>
      current.includes(tableId) ? current.filter((id) => id !== tableId) : [...current, tableId]
    );
  }

  function removeTable(tableId: string) {
    setSelectedTableIds((current) => current.filter((id) => id !== tableId));
    setManualRelations((current) =>
      current.filter((relation) => relation.sourceTableId !== tableId && relation.targetTableId !== tableId)
    );
    setFeedback({ type: 'success', message: 'Tabela removida do modelo.' });
  }

  function toggleField(fieldKey: string) {
    setSelectedFieldKeys((current) =>
      current.includes(fieldKey) ? current.filter((id) => id !== fieldKey) : [...current, fieldKey]
    );
  }

  function removeField(fieldKey: string) {
    setSelectedFieldKeys((current) => current.filter((id) => id !== fieldKey));
    setFieldAliases((current) => {
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
    setFeedback({ type: 'success', message: 'Campo removido do resultado.' });
  }

  function hasDuplicatedRelation(
    relations: ReportManualRelation[],
    sourceTableId: string,
    sourceFieldId: string,
    targetTableId: string,
    targetFieldId: string
  ) {
    return relations.some((item) => {
      const sameDirection =
        item.sourceTableId === sourceTableId &&
        item.sourceFieldId === sourceFieldId &&
        item.targetTableId === targetTableId &&
        item.targetFieldId === targetFieldId;
      const reversedDirection =
        item.sourceTableId === targetTableId &&
        item.sourceFieldId === targetFieldId &&
        item.targetTableId === sourceTableId &&
        item.targetFieldId === sourceFieldId;
      return (sameDirection || reversedDirection) && item.operator === 'equals';
    });
  }

  function createManualRelation(
    sourceTableId: string,
    sourceFieldId: string,
    targetTableId: string,
    targetFieldId: string,
    successMessage: string
  ) {
    if (!sourceTableId || !sourceFieldId || !targetTableId || !targetFieldId) {
      setFeedback({
        type: 'info',
        message: 'Selecione tabela e campo de origem e destino para criar a ligacao.'
      });
      return false;
    }

    if (sourceTableId === targetTableId) {
      setFeedback({
        type: 'info',
        message: 'Escolha um campo de outra tabela para criar a ligacao nesta etapa.'
      });
      return false;
    }

    let created = false;
    setManualRelations((current) => {
      const duplicated = hasDuplicatedRelation(current, sourceTableId, sourceFieldId, targetTableId, targetFieldId);
      if (duplicated) {
        return current;
      }
      created = true;
      return [
        ...current,
        {
          id: `ligacao-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
          sourceTableId,
          sourceFieldId,
          targetTableId,
          targetFieldId,
          operator: 'equals'
        }
      ];
    });

    if (!created) {
      setFeedback({
        type: 'info',
        message: 'Essa ligacao ja foi adicionada.'
      });
      return false;
    }

    const relationMapped = metadataRelations.some((relation) => {
      const sameDirection =
        relation.sourceTableId === sourceTableId &&
        relation.sourceFieldId === sourceFieldId &&
        relation.targetTableId === targetTableId &&
        relation.targetFieldId === targetFieldId;
      const reverseDirection =
        relation.sourceTableId === targetTableId &&
        relation.sourceFieldId === targetFieldId &&
        relation.targetTableId === sourceTableId &&
        relation.targetFieldId === sourceFieldId;
      return sameDirection || reverseDirection;
    });

    setFeedback({ type: 'success', message: successMessage });
    if (!relationMapped && metadataRelations.length > 0) {
      setFeedback({
        type: 'info',
        message:
          'Ligacao criada, mas esta combinacao nao esta no catalogo de relacoes sugeridas. Revise antes de executar no backend.'
      });
    }
    return true;
  }

  function handleRemoveManualRelation(relationId: string) {
    setManualRelations((current) => current.filter((item) => item.id !== relationId));
    setFeedback({ type: 'success', message: 'Ligacao removida com sucesso.' });
  }

  function handleCreateRelationFromCanvas(source: ReportFieldDragData, target: ReportFieldDragData) {
    createManualRelation(source.tableId, source.fieldId, target.tableId, target.fieldId, 'Ligacao criada com sucesso.');
  }

  function handleAddFilter() {
    if (!filterDraft.tableId || !filterDraft.fieldId || !filterDraft.condition) {
      setFeedback({
        type: 'info',
        message: 'Preencha tabela, campo, condicao e valor para adicionar o filtro.'
      });
      return;
    }

    if (!isNoValueCondition(filterDraft.condition) && !String(filterDraft.value).trim()) {
      setFeedback({
        type: 'info',
        message: 'Informe o valor do filtro para continuar.'
      });
      return;
    }

    if (isRangeCondition(filterDraft.condition) && !String(filterDraft.secondValue ?? '').trim()) {
      setFeedback({
        type: 'info',
        message: 'Informe o valor inicial e final para a condicao Entre.'
      });
      return;
    }

    const newFilter: ReportFilterRule = {
      id: `filtro-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      connector: filters.length === 0 ? 'E' : filterDraft.connector,
      tableId: filterDraft.tableId,
      fieldId: filterDraft.fieldId,
      fieldType: filterDraft.fieldType,
      condition: filterDraft.condition,
      value: String(filterDraft.value).trim(),
      secondValue: String(filterDraft.secondValue ?? '').trim()
    };

    setFilters((current) => [...current, newFilter]);
    setFilterDraft((current) => ({ ...current, fieldId: '', value: '', secondValue: '' }));
  }

  function handleRemoveFilter(filterId: string) {
    setFilters((current) => current.filter((item) => item.id !== filterId));
    setFeedback({ type: 'success', message: 'Filtro removido.' });
  }

  function handleClearFilters() {
    setFilters([]);
    setFeedback({ type: 'success', message: 'Filtros removidos com sucesso.' });
  }

  async function handlePreview() {
    if (selectedFieldKeys.length === 0) {
      setPreviewRows([]);
      setPreviewColumns([]);
      setPreviewWarning('');
      setPreviewSource('database');
      setFeedback({ type: 'info', message: 'Selecione pelo menos um campo para gerar a previa.' });
      return;
    }

    try {
      setPreviewLoading(true);
      const requestedLimit = Number(config.limit);
      const safeLimit =
        requestedLimit === 0 ? 100 : Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 50;

      const selectedFieldsPayload = selectedFieldKeys.map((fieldKey) => {
        const [tableId, fieldId] = fieldKey.split('.');
        const table = tableMap.get(tableId);
        const field = table?.fields.find((item) => item.id === fieldId);
        return {
          fieldId: fieldKey,
          alias: fieldAliases[fieldKey]?.trim() || undefined,
          label: field?.label ?? fieldId,
          dataType:
            field?.type === 'numero'
              ? 'number'
              : field?.type === 'data'
              ? 'date'
              : field?.type === 'booleano'
              ? 'boolean'
              : field?.type === 'lista'
              ? 'option'
              : 'text',
          isSensitive: Boolean(field?.isSensitive),
          maskType:
            field?.maskType === 'cpf' || field?.maskType === 'name' || field?.maskType === 'currency' || field?.maskType === 'date'
              ? field.maskType
              : 'none'
        } as const;
      });

      const filtersPayload = filters.map((filter, index) => {
        const fieldType = filter.fieldType ?? 'texto';
        const operatorMeta = filterOperatorMetadataByType[fieldType]?.find((item) => item.displayName === filter.condition);
        const operatorCode = operatorMeta?.operator ?? mapFallbackConditionToOperator(filter.condition);
        const requiresValue = operatorMeta?.requiresValue ?? !isNoValueCondition(filter.condition);
        const requiresSecondValue = operatorMeta?.requiresSecondValue ?? isRangeCondition(filter.condition);

        const payloadItem: {
          fieldId: string;
          operator: string;
          value?: string | number | boolean | Array<string | number>;
          secondValue?: string | number;
          logicalConnector?: 'AND' | 'OR';
        } = {
          fieldId: `${filter.tableId}.${filter.fieldId}`,
          operator: operatorCode,
          logicalConnector: index === 0 ? undefined : filter.connector === 'OU' ? 'OR' : 'AND'
        };

        if (requiresValue) {
          payloadItem.value = filter.value;
        }

        if (requiresSecondValue) {
          payloadItem.secondValue = filter.secondValue ?? '';
        }

        return payloadItem;
      });

      const relationsPayload = manualRelations.map((relation) => ({
        sourceFieldId: `${relation.sourceTableId}.${relation.sourceFieldId}`,
        targetFieldId: `${relation.targetTableId}.${relation.targetFieldId}`,
        operator: 'equals' as const
      }));

      const previewResult = await previewReport({
        selectedTables: selectedTableIds,
        selectedFields: selectedFieldsPayload,
        relations: relationsPayload,
        filters: filtersPayload,
        settings: {
          orderByFieldId: config.orderBy || undefined,
          orderDirection: config.orderDirection,
          limit: safeLimit,
          page: 1,
          pageSize: safeLimit,
          maskCpf: config.maskCpf,
          maskName: config.maskName,
          removeDuplicates: config.removeDuplicates
        },
        reportModelId: editingReportId ?? undefined
      });

      setPreviewColumns(previewResult.data.columns);
      setPreviewRows(previewResult.data.rows);
      setPreviewSource(previewResult.mode === 'api' ? 'database' : 'mock');
      setPreviewWarning(previewResult.warning ?? previewResult.data.warnings[0] ?? '');
      setFeedback({
        type: previewResult.mode === 'api' ? 'success' : 'info',
        message: previewResult.mode === 'api' ? 'Previa real atualizada com sucesso.' : (previewResult.warning ?? 'Previa local temporaria em uso.')
      });
    } catch (error) {
      setPreviewRows([]);
      setPreviewColumns([]);
      setPreviewWarning('');
      setPreviewSource('database');
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (error as { response: { data: { message: string } } }).response.data.message
          : 'Nao foi possivel gerar a previa real com a configuracao atual.';

      setFeedback({ type: 'info', message: errorMessage });
    } finally {
      setPreviewLoading(false);
    }
  }

  function handleSaveModel() {
    setSaveModalOpen(true);
  }

  async function handleConfirmSave(metadata: SavedReportMetadata) {
    if (selectedTableIds.length === 0) {
      setFeedback({ type: 'info', message: 'Selecione pelo menos uma tabela antes de salvar.' });
      return;
    }

    if (selectedFieldKeys.length === 0) {
      setFeedback({ type: 'info', message: 'Selecione pelo menos um campo de retorno antes de salvar.' });
      return;
    }

    if (selectedTableIds.length > 1 && manualRelations.length === 0) {
      setFeedback({
        type: 'info',
        message:
          'Voce selecionou mais de uma tabela. Crie uma ligacao entre elas para melhorar a consistencia do relatorio.'
      });
    }

    const payload = {
      selectedTableIds,
      selectedFieldKeys,
      fieldAliases,
      manualRelations,
      filters,
      sorting: {
        orderBy: config.orderBy,
        orderDirection: config.orderDirection
      },
      grouping: config.groupBy,
      limit: config.limit,
      showTotals: config.showTotals,
      maskCpf: config.maskCpf,
      maskName: config.maskName,
      removeDuplicates: config.removeDuplicates,
      tablePositions: canvasLayout.tablePositions,
      canvasZoom: canvasLayout.canvasZoom,
      canvasOffset: canvasLayout.canvasOffset,
      showConnections: canvasLayout.showConnections
    };

    setSavingModel(true);
    try {
      const result = editingReportId
        ? await updateReport(editingReportId, payload, metadata)
        : await saveReport(payload, metadata);
      const saved = result.data;

      if (!saved) {
        setFeedback({ type: 'info', message: 'Nao foi possivel salvar o relatorio.' });
        return;
      }

      setEditingReportId(saved.id);
      setSaveInitialData({
        name: saved.name,
        description: saved.description,
        category: saved.category,
        visibility: saved.visibility
      });
      setSaveModalOpen(false);
      setSearchParams({ modelId: saved.id });
      setFeedback({
        type: result.mode === 'local' ? 'info' : 'success',
        message:
          result.mode === 'local'
            ? 'Relatorio salvo localmente neste navegador. Quando o servidor estiver disponivel, salve novamente para sincronizar.'
            : 'Relatorio salvo com sucesso.'
      });
    } catch {
      setFeedback({ type: 'info', message: 'Nao foi possivel salvar o relatorio.' });
    } finally {
      setSavingModel(false);
    }
  }

  function handleExport() {
    setFeedback({
      type: 'info',
      message: 'Exportacao em preparacao para integracao com backend.'
    });
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gerador de Relatorios</h1>
            <p className="text-sm text-slate-600">
              Monte relatorios personalizados selecionando tabelas, campos, ligacoes e filtros.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary gap-2 px-4 py-2.5" onClick={() => clearBuilder('Novo relatorio iniciado.')}>
              <PlusCircle size={16} />
              Novo relatorio
            </button>
            <button type="button" className="btn-primary gap-2 px-4 py-2.5" onClick={() => navigate('/relatorios/modelos')}>
              <FolderOpen size={16} />
              Meus modelos salvos
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">1. Tabelas</p>
          <AvailableTablesPanel
            tables={tablesMetadata}
            categoryLabels={tableCategoryLabels}
            selectedTableIds={selectedTableIds}
            onToggleTable={toggleTable}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">2. Modelo visual</p>
        <ReportCanvas
          allTables={tablesMetadata}
          selectedTables={selectedTables}
          manualRelations={manualRelations}
          relationSuggestions={metadataRelations}
            selectedFieldKeys={selectedFieldKeys}
            onToggleField={toggleField}
            onRemoveTable={removeTable}
          onRemoveRelation={handleRemoveManualRelation}
          onCreateRelation={handleCreateRelationFromCanvas}
          initialLayout={canvasLayout}
          layoutSyncKey={canvasLayoutSyncKey}
          onLayoutChange={handleCanvasLayoutChange}
        />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            3. Campos do relatorio e configuracoes
          </p>
          <SelectedFieldsPanel
            allTables={tablesMetadata}
            selectedFieldKeys={selectedFieldKeys}
            fieldAliases={fieldAliases}
            config={config}
            onRemoveField={removeField}
            onAliasChange={(fieldKey, alias) =>
              setFieldAliases((current) => ({
                ...current,
                [fieldKey]: alias
              }))
            }
            onConfigChange={setConfig}
          />
        </div>
      </div>

      {selectedTableIds.length > 1 && manualRelations.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Voce selecionou mais de uma tabela. Crie uma ligacao entre elas para melhorar a consistencia do relatorio.
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">4. Filtros da consulta</p>
        <ReportFiltersPanel
          selectedTables={selectedTables}
          conditionsByType={filterConditionsByType}
          operatorMetadataByType={filterOperatorMetadataByType}
          draft={filterDraft}
          filters={filters}
          onDraftChange={setFilterDraft}
          onAddFilter={handleAddFilter}
          onRemoveFilter={handleRemoveFilter}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">5. Previa do resultado</p>
        <ReportPreviewTable
          selectedFieldKeys={selectedFieldKeys}
          allTables={tablesMetadata}
          fieldAliases={fieldAliases}
          previewColumns={previewColumns}
          rows={previewRows}
          filtersCount={filters.length}
          tablesUsed={selectedTableIds.length}
          relationsCount={manualRelations.length}
          maskCpf={config.maskCpf}
          maskName={config.maskName}
          previewSource={previewSource}
          isLoading={previewLoading}
          warning={previewWarning}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">6. Acoes</p>
        <ReportBuilderActions
          onPreview={handlePreview}
          onSaveModel={handleSaveModel}
          onExport={handleExport}
          onClear={handleClearWithConfirmation}
          onOpenModels={() => navigate('/relatorios/modelos')}
          onNewReport={() => clearBuilder('Novo relatorio iniciado.')}
          previewLoading={previewLoading}
        />
      </div>

      {feedback ? (
        <div
          className={
            feedback.type === 'success'
              ? 'alert-success'
              : 'rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800'
          }
        >
          {feedback.message}
        </div>
      ) : null}

      <SaveReportModal
        open={saveModalOpen}
        initialData={saveInitialData}
        saving={savingModel}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleConfirmSave}
      />
    </section>
  );
}
