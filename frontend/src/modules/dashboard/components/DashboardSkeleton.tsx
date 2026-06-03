interface SkeletonBlockProps {
  className?: string;
}

interface SkeletonRowsProps {
  columns: number;
  rows?: number;
}

export function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return <span className={`block animate-pulse rounded-md bg-slate-200/80 ${className}`} />;
}

export function MetricValueSkeleton() {
  return (
    <span className="block py-1">
      <SkeletonBlock className="h-8 w-32 max-w-full" />
    </span>
  );
}

export function MetricDescriptionSkeleton() {
  return <SkeletonBlock className="mt-2 h-3 w-40 max-w-full" />;
}

export function TableRowsSkeleton({ columns, rows = 3 }: SkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }, (_, columnIndex) => (
            <td key={columnIndex} className="px-4 py-3">
              <SkeletonBlock className={columnIndex === 0 ? 'h-4 w-28' : 'ml-auto h-4 w-20'} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonBlock key={index} className={index === 0 ? 'h-4 w-48 max-w-full' : 'h-4 w-full'} />
      ))}
    </div>
  );
}
