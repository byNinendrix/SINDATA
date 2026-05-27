import { Crosshair, LocateFixed, Minus, Plus, Scan, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ReportTableNode } from './ReportTableNode';
import type { ReportManualRelation, ReportTableMetadata } from '../types/reportBuilder.types';

interface ReportFieldDragData {
  tableId: string;
  fieldId: string;
}

interface CanvasPoint {
  x: number;
  y: number;
}

interface TablePosition {
  x: number;
  y: number;
}

interface ReportCanvasProps {
  allTables: ReportTableMetadata[];
  selectedTables: ReportTableMetadata[];
  manualRelations: ReportManualRelation[];
  selectedFieldKeys: string[];
  onToggleField: (fieldKey: string) => void;
  onRemoveTable: (tableId: string) => void;
  onRemoveRelation: (relationId: string) => void;
  onCreateRelation: (source: ReportFieldDragData, target: ReportFieldDragData) => void;
}

const TABLE_WIDTH = 320;
const TABLE_HEIGHT = 420;
const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 2200;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.8;
const DEFAULT_ZOOM = 1;

function fieldKey(tableId: string, fieldId: string) {
  return `${tableId}.${fieldId}`;
}

function clampZoom(value: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
}

function getDefaultPosition(index: number): TablePosition {
  const columns = 3;
  const col = index % columns;
  const row = Math.floor(index / columns);
  return { x: 80 + col * 360, y: 80 + row * 460 };
}

function getFieldLabel(allTables: ReportTableMetadata[], tableId: string, fieldId: string) {
  const table = allTables.find((item) => item.id === tableId);
  return table?.fields.find((item) => item.id === fieldId)?.label ?? fieldId;
}

function getConnectionPath(source: CanvasPoint, target: CanvasPoint) {
  const offset = Math.max(60, Math.abs(target.x - source.x) * 0.35);
  return `M ${source.x} ${source.y} C ${source.x + offset} ${source.y}, ${target.x - offset} ${target.y}, ${target.x} ${target.y}`;
}

interface RelationGroup {
  sourceTableId: string;
  targetTableId: string;
  relations: ReportManualRelation[];
}

export function ReportCanvas({
  allTables,
  selectedTables,
  manualRelations,
  selectedFieldKeys,
  onToggleField,
  onRemoveTable,
  onRemoveRelation,
  onCreateRelation
}: ReportCanvasProps) {
  const [tablePositions, setTablePositions] = useState<Record<string, TablePosition>>({});
  const [canvasZoom, setCanvasZoom] = useState(DEFAULT_ZOOM);
  const [canvasOffset, setCanvasOffset] = useState<CanvasPoint>({ x: 0, y: 0 });
  const [draggingTable, setDraggingTable] = useState<{
    tableId: string;
    startPointer: CanvasPoint;
    startPosition: TablePosition;
  } | null>(null);
  const [panning, setPanning] = useState<{
    startPointer: CanvasPoint;
    startOffset: CanvasPoint;
  } | null>(null);
  const [connectionDrag, setConnectionDrag] = useState<{
    source: ReportFieldDragData;
    pointer: CanvasPoint;
  } | null>(null);
  const [hoverDropFieldKey, setHoverDropFieldKey] = useState<string | null>(null);
  const [anchorTick, setAnchorTick] = useState(0);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const anchorElementsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  const selectedFieldSet = useMemo(() => new Set(selectedFieldKeys), [selectedFieldKeys]);
  const tableNameById = useMemo(() => new Map(allTables.map((table) => [table.id, table.name])), [allTables]);

  const relationGroups = useMemo(() => {
    const grouped = new Map<string, RelationGroup>();
    for (const relation of manualRelations) {
      const key = `${relation.sourceTableId}->${relation.targetTableId}`;
      const current = grouped.get(key);
      if (current) {
        current.relations.push(relation);
        continue;
      }
      grouped.set(key, {
        sourceTableId: relation.sourceTableId,
        targetTableId: relation.targetTableId,
        relations: [relation]
      });
    }
    return Array.from(grouped.values());
  }, [manualRelations]);

  const manualRelationFieldKeys = useMemo(
    () =>
      new Set(
        manualRelations.flatMap((relation) => [
          fieldKey(relation.sourceTableId, relation.sourceFieldId),
          fieldKey(relation.targetTableId, relation.targetFieldId)
        ])
      ),
    [manualRelations]
  );

  useEffect(() => {
    setTablePositions((current) => {
      const next: Record<string, TablePosition> = {};
      selectedTables.forEach((table, index) => {
        next[table.id] = current[table.id] ?? getDefaultPosition(index);
      });
      return next;
    });
  }, [selectedTables]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (draggingTable) {
        const deltaX = (event.clientX - draggingTable.startPointer.x) / canvasZoom;
        const deltaY = (event.clientY - draggingTable.startPointer.y) / canvasZoom;
        setTablePositions((current) => ({
          ...current,
          [draggingTable.tableId]: {
            x: draggingTable.startPosition.x + deltaX,
            y: draggingTable.startPosition.y + deltaY
          }
        }));
        setAnchorTick((current) => current + 1);
      }

      if (panning) {
        const deltaX = event.clientX - panning.startPointer.x;
        const deltaY = event.clientY - panning.startPointer.y;
        setCanvasOffset({
          x: panning.startOffset.x + deltaX,
          y: panning.startOffset.y + deltaY
        });
        setAnchorTick((current) => current + 1);
      }

      if (connectionDrag) {
        setConnectionDrag((current) => (current ? { ...current, pointer: { x: event.clientX, y: event.clientY } } : current));

        const hoveredElement = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
        const fieldElement = hoveredElement?.closest('[data-report-field-key]') as HTMLElement | null;
        if (!fieldElement) {
          setHoverDropFieldKey(null);
          return;
        }

        const targetTableId = fieldElement.dataset.tableId ?? '';
        const targetFieldId = fieldElement.dataset.fieldId ?? '';
        if (!targetTableId || !targetFieldId) {
          setHoverDropFieldKey(null);
          return;
        }

        if (targetTableId === connectionDrag.source.tableId) {
          setHoverDropFieldKey(null);
          return;
        }

        setHoverDropFieldKey(fieldKey(targetTableId, targetFieldId));
      }
    }

    function handlePointerUp(event: PointerEvent) {
      if (draggingTable) {
        setDraggingTable(null);
      }

      if (panning) {
        setPanning(null);
      }

      if (connectionDrag) {
        const hoveredElement = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
        const fieldElement = hoveredElement?.closest('[data-report-field-key]') as HTMLElement | null;
        if (fieldElement) {
          const targetTableId = fieldElement.dataset.tableId ?? '';
          const targetFieldId = fieldElement.dataset.fieldId ?? '';
          if (targetTableId && targetFieldId) {
            onCreateRelation(connectionDrag.source, { tableId: targetTableId, fieldId: targetFieldId });
          }
        }
        setConnectionDrag(null);
        setHoverDropFieldKey(null);
      }
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [canvasZoom, connectionDrag, draggingTable, onCreateRelation, panning]);

  useEffect(() => {
    function handleResize() {
      setAnchorTick((current) => current + 1);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function startTableDrag(tableId: string, event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const startPosition = tablePositions[tableId] ?? { x: 0, y: 0 };
    setDraggingTable({
      tableId,
      startPointer: { x: event.clientX, y: event.clientY },
      startPosition
    });
  }

  function startConnectionDrag(source: ReportFieldDragData, event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setConnectionDrag({
      source,
      pointer: { x: event.clientX, y: event.clientY }
    });
    setHoverDropFieldKey(null);
  }

  function startCanvasPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    setPanning({
      startPointer: { x: event.clientX, y: event.clientY },
      startOffset: canvasOffset
    });
  }

  function registerFieldAnchor(tableId: string, fieldId: string, element: HTMLButtonElement | null) {
    const key = fieldKey(tableId, fieldId);
    if (element) {
      anchorElementsRef.current.set(key, element);
    } else {
      anchorElementsRef.current.delete(key);
    }
  }

  function zoomBy(step: number) {
    setCanvasZoom((current) => clampZoom(current + step));
    setAnchorTick((current) => current + 1);
  }

  function resetZoom() {
    setCanvasZoom(DEFAULT_ZOOM);
    setAnchorTick((current) => current + 1);
  }

  function resetCanvasPosition() {
    setCanvasOffset({ x: 0, y: 0 });
    setAnchorTick((current) => current + 1);
  }

  function resetModelLayout() {
    const nextPositions: Record<string, TablePosition> = {};
    selectedTables.forEach((table, index) => {
      nextPositions[table.id] = getDefaultPosition(index);
    });
    setTablePositions(nextPositions);
    setCanvasOffset({ x: 0, y: 0 });
    setCanvasZoom(DEFAULT_ZOOM);
    setAnchorTick((current) => current + 1);
  }

  function getSelectedBounds() {
    if (selectedTables.length === 0) {
      return null;
    }
    const positions = selectedTables.map((table, index) => tablePositions[table.id] ?? getDefaultPosition(index));
    const minX = Math.min(...positions.map((position) => position.x));
    const minY = Math.min(...positions.map((position) => position.y));
    const maxX = Math.max(...positions.map((position) => position.x + TABLE_WIDTH));
    const maxY = Math.max(...positions.map((position) => position.y + TABLE_HEIGHT));
    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  function centerModel(zoom = canvasZoom) {
    const viewport = viewportRef.current;
    const bounds = getSelectedBounds();
    if (!viewport || !bounds) {
      return;
    }
    const viewportRect = viewport.getBoundingClientRect();
    const x = viewportRect.width / 2 - (bounds.minX + bounds.width / 2) * zoom;
    const y = viewportRect.height / 2 - (bounds.minY + bounds.height / 2) * zoom;
    setCanvasOffset({ x, y });
    setAnchorTick((current) => current + 1);
  }

  function fitToScreen() {
    const viewport = viewportRef.current;
    const bounds = getSelectedBounds();
    if (!viewport || !bounds) {
      return;
    }
    const viewportRect = viewport.getBoundingClientRect();
    const padding = 120;
    const nextZoom = clampZoom(
      Math.min((viewportRect.width - padding) / bounds.width, (viewportRect.height - padding) / bounds.height)
    );
    setCanvasZoom(nextZoom);
    const nextOffset = {
      x: viewportRect.width / 2 - (bounds.minX + bounds.width / 2) * nextZoom,
      y: viewportRect.height / 2 - (bounds.minY + bounds.height / 2) * nextZoom
    };
    setCanvasOffset(nextOffset);
    setAnchorTick((current) => current + 1);
  }

  const connectionLines = useMemo(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return [];
    }
    const viewportRect = viewport.getBoundingClientRect();

    return manualRelations
      .map((relation) => {
        const sourceEl = anchorElementsRef.current.get(fieldKey(relation.sourceTableId, relation.sourceFieldId));
        const targetEl = anchorElementsRef.current.get(fieldKey(relation.targetTableId, relation.targetFieldId));
        if (!sourceEl || !targetEl) {
          return null;
        }
        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const source = {
          x: sourceRect.left - viewportRect.left + sourceRect.width / 2,
          y: sourceRect.top - viewportRect.top + sourceRect.height / 2
        };
        const target = {
          x: targetRect.left - viewportRect.left + targetRect.width / 2,
          y: targetRect.top - viewportRect.top + targetRect.height / 2
        };
        return {
          id: relation.id,
          path: getConnectionPath(source, target),
          source,
          target
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [anchorTick, canvasOffset, canvasZoom, manualRelations, selectedTables, tablePositions]);

  const temporaryConnectionLine = useMemo(() => {
    if (!connectionDrag || !viewportRef.current) {
      return null;
    }

    const sourceEl = anchorElementsRef.current.get(fieldKey(connectionDrag.source.tableId, connectionDrag.source.fieldId));
    if (!sourceEl) {
      return null;
    }

    const viewportRect = viewportRef.current.getBoundingClientRect();
    const sourceRect = sourceEl.getBoundingClientRect();
    const source = {
      x: sourceRect.left - viewportRect.left + sourceRect.width / 2,
      y: sourceRect.top - viewportRect.top + sourceRect.height / 2
    };
    const target = {
      x: connectionDrag.pointer.x - viewportRect.left,
      y: connectionDrag.pointer.y - viewportRect.top
    };

    return {
      path: getConnectionPath(source, target),
      source,
      target
    };
  }, [anchorTick, canvasOffset, canvasZoom, connectionDrag, tablePositions]);

  const zoomLabel = `${Math.round(canvasZoom * 100)}%`;

  return (
    <article className="ds-card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Modelo do relatorio</h3>
          <p className="mt-1 text-xs text-slate-600">
            Visualize as tabelas escolhidas, suas ligacoes e os campos de retorno.
          </p>
          <p className="mt-2 text-xs text-cyan-700">
            Para criar uma ligacao, arraste o icone de conexao de um campo ate o campo correspondente em outra tabela.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Checkbox = campo do relatorio. Icone de conexao = arraste para ligar tabelas. Arraste o cabecalho da tabela
            para reposicionar.
          </p>
          <p className="mt-2 text-xs font-medium text-slate-700">
            {selectedTables.length} tabela(s) selecionada(s) · {selectedFieldKeys.length} campo(s) de retorno ·{' '}
            {manualRelations.length} ligacao(oes) criada(s)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary h-8 px-2.5 text-xs" onClick={() => zoomBy(-0.1)}>
            <Minus size={14} />
          </button>
          <span className="inline-flex h-8 min-w-[58px] items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700">
            {zoomLabel}
          </span>
          <button type="button" className="btn-secondary h-8 px-2.5 text-xs" onClick={() => zoomBy(0.1)}>
            <Plus size={14} />
          </button>
          <button type="button" className="btn-secondary h-8 px-2.5 text-xs" onClick={resetZoom}>
            Resetar zoom
          </button>
          <button type="button" className="btn-secondary h-8 gap-1.5 px-2.5 text-xs" onClick={fitToScreen}>
            <Scan size={13} />
            Ajustar a tela
          </button>
          <button type="button" className="btn-secondary h-8 gap-1.5 px-2.5 text-xs" onClick={resetCanvasPosition}>
            <Crosshair size={13} />
            Resetar posicao
          </button>
          <button type="button" className="btn-secondary h-8 gap-1.5 px-2.5 text-xs" onClick={() => centerModel()}>
            <LocateFixed size={13} />
            Centralizar modelo
          </button>
          <button type="button" className="btn-secondary h-8 px-2.5 text-xs" onClick={resetModelLayout}>
            Resetar layout
          </button>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h4 className="text-sm font-semibold text-slate-900">Ligacoes criadas</h4>
        {relationGroups.length === 0 ? (
          <p className="text-xs text-slate-600">Nenhuma ligacao criada para a selecao atual.</p>
        ) : (
          <div className="space-y-2">
            {relationGroups.map((group) => (
              <div key={`${group.sourceTableId}-${group.targetTableId}`} className="rounded-lg border border-slate-200 bg-white p-2.5">
                <p className="text-xs font-semibold text-slate-800">
                  {tableNameById.get(group.sourceTableId) ?? group.sourceTableId} {'->'}{' '}
                  {tableNameById.get(group.targetTableId) ?? group.targetTableId}
                </p>
                <div className="mt-2 space-y-1.5">
                  {group.relations.map((relation) => (
                    <div key={relation.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700">
                      <span>
                        {getFieldLabel(allTables, relation.sourceTableId, relation.sourceFieldId)} {'->'}{' '}
                        {getFieldLabel(allTables, relation.targetTableId, relation.targetFieldId)}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        onClick={() => onRemoveRelation(relation.id)}
                        aria-label="Remover ligacao"
                        title="Remover ligacao"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        ref={viewportRef}
        className="relative h-[720px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
        onPointerDown={startCanvasPan}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasZoom})`,
            transformOrigin: '0 0'
          }}
        >
          {selectedTables.map((table) => (
            <ReportTableNode
              key={table.id}
              table={table}
              position={tablePositions[table.id] ?? { x: 0, y: 0 }}
              selectedFieldKeys={selectedFieldSet}
              manualRelationFieldKeys={manualRelationFieldKeys}
              isConnecting={Boolean(connectionDrag)}
              connectionSourceFieldKey={connectionDrag ? fieldKey(connectionDrag.source.tableId, connectionDrag.source.fieldId) : null}
              hoverDropFieldKey={hoverDropFieldKey}
              onToggleField={onToggleField}
              onRemoveTable={onRemoveTable}
              onStartTableDrag={startTableDrag}
              onStartConnectionDrag={startConnectionDrag}
              onRegisterFieldAnchor={registerFieldAnchor}
              onFieldsScroll={() => setAnchorTick((current) => current + 1)}
            />
          ))}
        </div>

        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {connectionLines.map((line) => (
            <g key={line.id}>
              <path d={line.path} stroke="#0f766e" strokeWidth={2} fill="none" />
              <circle cx={line.source.x} cy={line.source.y} r={4} fill="#0f766e" />
              <circle cx={line.target.x} cy={line.target.y} r={4} fill="#0f766e" />
            </g>
          ))}

          {temporaryConnectionLine ? (
            <g>
              <path d={temporaryConnectionLine.path} stroke="#0891b2" strokeWidth={2} strokeDasharray="5 4" fill="none" />
              <circle cx={temporaryConnectionLine.source.x} cy={temporaryConnectionLine.source.y} r={4} fill="#0891b2" />
              <circle cx={temporaryConnectionLine.target.x} cy={temporaryConnectionLine.target.y} r={4} fill="#0891b2" />
            </g>
          ) : null}
        </svg>
      </div>
    </article>
  );
}
