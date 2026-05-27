interface TableRelationLineProps {
  fromLabel: string;
  toLabel: string;
  fromFieldLabel?: string;
  toFieldLabel?: string;
}

export function TableRelationLine({
  fromLabel,
  toLabel,
  fromFieldLabel,
  toFieldLabel
}: TableRelationLineProps) {
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 px-2.5 py-1.5 text-xs text-cyan-900">
      <div className="inline-flex items-center gap-2">
        <span className="font-medium">{fromLabel}</span>
        <span aria-hidden>{'->'}</span>
        <span className="font-medium">{toLabel}</span>
      </div>
      {fromFieldLabel && toFieldLabel ? (
        <p className="mt-1 text-[11px] text-cyan-800">
          Campos de ligacao: {fromFieldLabel} {'->'} {toFieldLabel}
        </p>
      ) : null}
    </div>
  );
}
