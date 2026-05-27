import type { ReportFiltersState } from '../types/reportBuilder.types';

interface FilterBuilderProps {
  filters: ReportFiltersState;
  regionalOptions: string[];
  municipioOptions: string[];
  situacaoOptions: string[];
  onChange: (next: ReportFiltersState) => void;
}

export function FilterBuilder({
  filters,
  regionalOptions,
  municipioOptions,
  situacaoOptions,
  onChange
}: FilterBuilderProps) {
  return (
    <article className="ds-card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">4. Filtros</h3>
        <p className="mt-1 text-sm text-slate-600">Ajuste filtros visuais para apoiar a montagem do relatório.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="form-label">
          Regional
          <select
            className="form-input mt-1"
            value={filters.regional}
            onChange={(event) => onChange({ ...filters, regional: event.target.value })}
          >
            <option value="">Todas</option>
            {regionalOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Município
          <select
            className="form-input mt-1"
            value={filters.municipio}
            onChange={(event) => onChange({ ...filters, municipio: event.target.value })}
          >
            <option value="">Todos</option>
            {municipioOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Situação
          <select
            className="form-input mt-1"
            value={filters.situacao}
            onChange={(event) => onChange({ ...filters, situacao: event.target.value })}
          >
            <option value="">Todas</option>
            {situacaoOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1">
          <label className="form-label">
            Período inicial
            <input
              type="date"
              className="form-input mt-1"
              value={filters.periodoInicio}
              onChange={(event) => onChange({ ...filters, periodoInicio: event.target.value })}
            />
          </label>
          <label className="form-label">
            Período final
            <input
              type="date"
              className="form-input mt-1"
              value={filters.periodoFim}
              onChange={(event) => onChange({ ...filters, periodoFim: event.target.value })}
            />
          </label>
        </div>
      </div>
    </article>
  );
}
