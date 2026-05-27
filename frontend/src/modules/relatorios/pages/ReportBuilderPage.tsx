import { useEffect, useMemo, useState } from 'react';
import { AvailableTablesPanel } from '../components/AvailableTablesPanel';
import { ReportBuilderActions } from '../components/ReportBuilderActions';
import { ReportCanvas } from '../components/ReportCanvas';
import { ReportFiltersPanel } from '../components/ReportFiltersPanel';
import { ReportPreviewTable } from '../components/ReportPreviewTable';
import { SelectedFieldsPanel } from '../components/SelectedFieldsPanel';
import {
  initialReportConfig,
  initialReportFilterDraft,
  reportFilterConditionsMock,
  reportTablesMetadataMock
} from '../mocks/reportBuilderMocks';
import { fetchRealReportPreview } from '../services/reportPreviewService';
import type {
  ReportBuilderConfig,
  ReportFilterRule,
  ReportManualRelation
} from '../types/reportBuilder.types';

interface FeedbackState {
  type: 'success' | 'info';
  message: string;
}

interface ReportFieldDragData {
  tableId: string;
  fieldId: string;
}

export function ReportBuilderPage() {
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>([]);
  const [manualRelations, setManualRelations] = useState<ReportManualRelation[]>([]);
  const [filters, setFilters] = useState<ReportFilterRule[]>([]);
  const [filterDraft, setFilterDraft] = useState(initialReportFilterDraft);
  const [config, setConfig] = useState<ReportBuilderConfig>(initialReportConfig);
  const [previewRows, setPreviewRows] = useState<Array<Record<string, unknown>>>([]);
  const [previewSource, setPreviewSource] = useState<'mock' | 'database'>('database');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const tableMap = useMemo(() => {
    return new Map(reportTablesMetadataMock.map((table) => [table.id, table]));
  }, []);

  const selectedTables = useMemo(() => {
    return selectedTableIds
      .map((tableId) => tableMap.get(tableId))
      .filter((table): table is NonNullable<typeof table> => Boolean(table));
  }, [selectedTableIds, tableMap]);

  const availableFieldKeys = useMemo(() => {
    return selectedTables.flatMap((table) => table.fields.map((field) => `${table.id}.${field.id}`));
  }, [selectedTables]);

  useEffect(() => {
    const availableSet = new Set(availableFieldKeys);
    setSelectedFieldKeys((current) => current.filter((fieldKey) => availableSet.has(fieldKey)));
    setFilters((current) => current.filter((filter) => selectedTableIds.includes(filter.tableId)));
    setConfig((current) => ({
      ...current,
      orderBy: availableSet.has(current.orderBy) ? current.orderBy : '',
      groupBy: availableSet.has(current.groupBy) ? current.groupBy : ''
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
  }, [availableFieldKeys, selectedTableIds]);

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
  }

  function toggleField(fieldKey: string) {
    setSelectedFieldKeys((current) =>
      current.includes(fieldKey) ? current.filter((id) => id !== fieldKey) : [...current, fieldKey]
    );
  }

  function removeField(fieldKey: string) {
    setSelectedFieldKeys((current) => current.filter((id) => id !== fieldKey));
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

    setFeedback({ type: 'success', message: successMessage });
    return true;
  }

  function handleRemoveManualRelation(relationId: string) {
    setManualRelations((current) => current.filter((item) => item.id !== relationId));
  }

  function handleCreateRelationFromCanvas(source: ReportFieldDragData, target: ReportFieldDragData) {
    createManualRelation(source.tableId, source.fieldId, target.tableId, target.fieldId, 'Ligacao criada com sucesso.');
  }

  function handleAddFilter() {
    if (!filterDraft.tableId || !filterDraft.fieldId || !filterDraft.condition || !filterDraft.value.trim()) {
      setFeedback({
        type: 'info',
        message: 'Preencha tabela, campo, condicao e valor para adicionar o filtro.'
      });
      return;
    }

    if (filterDraft.condition === 'Entre' && !(filterDraft.secondValue ?? '').trim()) {
      setFeedback({
        type: 'info',
        message: 'Informe o valor inicial e final para a condicao Entre.'
      });
      return;
    }

    const newFilter: ReportFilterRule = {
      id: `filtro-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      tableId: filterDraft.tableId,
      fieldId: filterDraft.fieldId,
      condition: filterDraft.condition,
      value: filterDraft.value.trim(),
      secondValue: filterDraft.secondValue?.trim() ?? ''
    };

    setFilters((current) => [...current, newFilter]);
    setFilterDraft((current) => ({ ...current, fieldId: '', value: '', secondValue: '' }));
  }

  function handleRemoveFilter(filterId: string) {
    setFilters((current) => current.filter((item) => item.id !== filterId));
  }

  async function handlePreview() {
    if (selectedFieldKeys.length === 0) {
      setPreviewRows([]);
      setPreviewSource('database');
      setFeedback({ type: 'info', message: 'Selecione pelo menos um campo para gerar a previa.' });
      return;
    }

    try {
      const requestedLimit = Number(config.limit);
      const safeLimit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 5;

      const preview = await fetchRealReportPreview({
        selectedTableIds,
        selectedFieldKeys,
        manualRelations,
        filters,
        limit: safeLimit,
        orderBy: config.orderBy || undefined
      });

      setPreviewRows(preview.rows.slice(0, 5));
      setPreviewSource('database');
      setFeedback({ type: 'success', message: 'Previa real atualizada com sucesso.' });
    } catch (error) {
      setPreviewRows([]);
      setPreviewSource('database');
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (error as { response: { data: { message: string } } }).response.data.message
          : 'Nao foi possivel gerar a previa real com a configuracao atual.';

      setFeedback({ type: 'info', message: errorMessage });
    }
  }

  function handleSaveModel() {
    setFeedback({ type: 'info', message: 'Salvar modelo sera implementado na proxima etapa.' });
  }

  function handleExport() {
    setFeedback({ type: 'info', message: 'Exportacao sera implementada na proxima etapa.' });
  }

  function handleClear() {
    setSelectedTableIds([]);
    setSelectedFieldKeys([]);
    setManualRelations([]);
    setFilters([]);
    setFilterDraft(initialReportFilterDraft);
    setConfig(initialReportConfig);
    setPreviewRows([]);
    setPreviewSource('database');
    setFeedback({ type: 'success', message: 'Construcao do relatorio limpa com sucesso.' });
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Gerador de Relatorios</h1>
        <p className="text-sm text-slate-600">
          Monte relatorios personalizados selecionando tabelas, ligacoes e campos de retorno.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <AvailableTablesPanel
          tables={reportTablesMetadataMock}
          selectedTableIds={selectedTableIds}
          onToggleTable={toggleTable}
        />

        <ReportCanvas
          allTables={reportTablesMetadataMock}
          selectedTables={selectedTables}
          manualRelations={manualRelations}
          selectedFieldKeys={selectedFieldKeys}
          onToggleField={toggleField}
          onRemoveTable={removeTable}
          onRemoveRelation={handleRemoveManualRelation}
          onCreateRelation={handleCreateRelationFromCanvas}
        />

        <SelectedFieldsPanel
          allTables={reportTablesMetadataMock}
          selectedFieldKeys={selectedFieldKeys}
          config={config}
          onRemoveField={removeField}
          onConfigChange={setConfig}
        />
      </div>

      <ReportFiltersPanel
        selectedTables={selectedTables}
        conditions={reportFilterConditionsMock}
        draft={filterDraft}
        filters={filters}
        onDraftChange={setFilterDraft}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
      />

      <ReportPreviewTable
        selectedFieldKeys={selectedFieldKeys}
        allTables={reportTablesMetadataMock}
        rows={previewRows}
        filtersCount={filters.length}
        tablesUsed={selectedTableIds.length}
        relationsCount={manualRelations.length}
        maskCpf={config.maskCpf}
        previewSource={previewSource}
      />

      <ReportBuilderActions
        onPreview={handlePreview}
        onSaveModel={handleSaveModel}
        onExport={handleExport}
        onClear={handleClear}
      />

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
    </section>
  );
}
