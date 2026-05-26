import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Save, Search } from 'lucide-react';
import api from '../../../services/api';

interface EntePublicoOpcaoItem {
  codigoEmpresa: string;
  descricaoEmpresa: string;
  codigoPredio: string;
  descricaoPredio: string;
  estadual: boolean;
}

interface EntePublicoOpcoesResponse {
  items: EntePublicoOpcaoItem[];
}

function buildKey(codigoEmpresa: string, codigoPredio: string) {
  return `${codigoEmpresa}::${codigoPredio}`;
}

export function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [savingBatch, setSavingBatch] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [empresaFiltro, setEmpresaFiltro] = useState('');
  const [termo, setTermo] = useState('');
  const [items, setItems] = useState<EntePublicoOpcaoItem[]>([]);
  const [estadoDraft, setEstadoDraft] = useState<Record<string, boolean>>({});
  const gradeResultadosRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get<{ data: EntePublicoOpcoesResponse }>('/configuracoes/ente-publico/opcoes');
        const loaded = response.data.data.items ?? [];
        setItems(loaded);

        const initialDraft: Record<string, boolean> = {};
        for (const item of loaded) {
          initialDraft[buildKey(item.codigoEmpresa, item.codigoPredio)] = item.estadual;
        }
        setEstadoDraft(initialDraft);
      } catch {
        setItems([]);
        setError('Não foi possível carregar as configurações de ente público.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);
  useEffect(() => {
    if (!empresaFiltro) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      gradeResultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      gradeResultadosRef.current?.focus();
    }, 60);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [empresaFiltro]);

  const empresas = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.codigoEmpresa, item.descricaoEmpresa);
    }

    return Array.from(map.entries())
      .map(([codigo, descricao]) => ({ codigo, descricao }))
      .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'));
  }, [items]);

  const itensFiltrados = useMemo(() => {
    if (!empresaFiltro) {
      return [];
    }

    const normalizedTerm = termo.trim().toLowerCase();
    return items.filter((item) => {
      if (item.codigoEmpresa !== empresaFiltro) {
        return false;
      }

      if (!normalizedTerm) {
        return true;
      }

      const target = `${item.codigoEmpresa} ${item.descricaoEmpresa} ${item.codigoPredio} ${item.descricaoPredio}`.toLowerCase();
      return target.includes(normalizedTerm);
    });
  }, [items, empresaFiltro, termo]);

  const itensDoEstado = useMemo(
    () =>
      items.filter((item) => {
        return item.estadual;
      }),
    [items]
  );

  const itensDemais = useMemo(
    () =>
      itensFiltrados.filter((item) => {
        return !item.estadual;
      }),
    [itensFiltrados]
  );

  const itensFiltradosAlterados = useMemo(
    () =>
      itensFiltrados.filter((item) => {
        const key = buildKey(item.codigoEmpresa, item.codigoPredio);
        return Boolean(estadoDraft[key]) !== item.estadual;
      }),
    [itensFiltrados, estadoDraft]
  );

  const itensElegiveisLote = useMemo(
    () =>
      itensFiltrados.filter((item) => {
        return !item.estadual;
      }),
    [itensFiltrados]
  );

  const podeMarcarTodos = useMemo(
    () =>
      itensElegiveisLote.some((item) => {
        const key = buildKey(item.codigoEmpresa, item.codigoPredio);
        return !Boolean(estadoDraft[key]);
      }),
    [itensElegiveisLote, estadoDraft]
  );

  const podeDesmarcarTodos = useMemo(
    () =>
      itensElegiveisLote.some((item) => {
        const key = buildKey(item.codigoEmpresa, item.codigoPredio);
        return Boolean(estadoDraft[key]);
      }),
    [itensElegiveisLote, estadoDraft]
  );

  async function saveItem(item: EntePublicoOpcaoItem) {
    const key = buildKey(item.codigoEmpresa, item.codigoPredio);
    const estadual = Boolean(estadoDraft[key]);

    setSavingKey(key);
    setError('');
    setSuccess('');

    try {
      await api.post('/configuracoes/ente-publico', {
        codigoEmpresa: item.codigoEmpresa,
        codigoPredio: item.codigoPredio,
        estadual
      });

      setItems((current) =>
        current.map((row) =>
          row.codigoEmpresa === item.codigoEmpresa && row.codigoPredio === item.codigoPredio
            ? { ...row, estadual }
            : row
        )
      );

      setSuccess('Configuração salva com sucesso.');
    } catch {
      setError('Não foi possível salvar a configuração.');
    } finally {
      setSavingKey('');
    }
  }

  function aplicarEstadoEmLote(estado: boolean) {
    if (!empresaFiltro || itensElegiveisLote.length === 0) {
      return;
    }

    setEstadoDraft((current) => {
      const next = { ...current };
      for (const item of itensElegiveisLote) {
        next[buildKey(item.codigoEmpresa, item.codigoPredio)] = estado;
      }
      return next;
    });
    setError('');
    setSuccess('');
  }

  async function saveBatch() {
    if (!empresaFiltro || itensFiltradosAlterados.length === 0) {
      return;
    }

    setSavingBatch(true);
    setSavingKey('');
    setError('');
    setSuccess('');

    const changedItems = [...itensFiltradosAlterados];
    const results = await Promise.allSettled(
      changedItems.map((item) =>
        api.post('/configuracoes/ente-publico', {
          codigoEmpresa: item.codigoEmpresa,
          codigoPredio: item.codigoPredio,
          estadual: Boolean(estadoDraft[buildKey(item.codigoEmpresa, item.codigoPredio)])
        })
      )
    );

    const savedKeys = new Set<string>();
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const item = changedItems[index];
        savedKeys.add(buildKey(item.codigoEmpresa, item.codigoPredio));
      }
    });

    if (savedKeys.size > 0) {
      setItems((current) =>
        current.map((row) => {
          const key = buildKey(row.codigoEmpresa, row.codigoPredio);
          if (!savedKeys.has(key)) {
            return row;
          }
          return {
            ...row,
            estadual: Boolean(estadoDraft[key])
          };
        })
      );
    }

    const failedCount = results.length - savedKeys.size;
    if (failedCount > 0) {
      setError(
        `${failedCount} de ${results.length} registro(s) não foram salvos. Tente novamente para concluir a manutenção.`
      );
    } else {
      setSuccess(`${savedKeys.size} registro(s) salvos com sucesso.`);
    }

    setSavingBatch(false);
  }

  function renderTabela(itemsToRender: EntePublicoOpcaoItem[], emptyMessage: string) {
    return (
      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ente Público
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Prédio
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                E do Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  Carregando opções de configuração...
                </td>
              </tr>
            ) : itemsToRender.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              itemsToRender.map((item) => {
                const key = buildKey(item.codigoEmpresa, item.codigoPredio);
                const checked = Boolean(estadoDraft[key]);
                const changed = checked !== item.estadual;
                const isSaving = savingKey === key;

                return (
                  <tr key={key} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <div className="font-medium text-slate-800">{item.descricaoEmpresa}</div>
                      <div className="text-xs text-slate-500">Código: {item.codigoEmpresa}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <div className="font-medium text-slate-800">{item.descricaoPredio}</div>
                      <div className="text-xs text-slate-500">Código: {item.codigoPredio}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-sindata-700 focus:ring-cyan-100"
                          checked={checked}
                          onChange={(event) =>
                            setEstadoDraft((current) => ({
                              ...current,
                              [key]: event.target.checked
                            }))
                          }
                        />
                        <span>{checked ? 'Sim' : 'Não'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="btn-secondary inline-flex items-center gap-1"
                        disabled={!changed || isSaving || savingBatch}
                        onClick={() => saveItem(item)}
                      >
                        <Save size={14} />
                        {isSaving ? 'Salvando...' : 'Salvar'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-sindata-900">Configurações</h2>
        <p className="mt-1 text-slate-600">Definições de negócio para continuidade das regras do sistema.</p>
      </header>

      <article className="ds-card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Ente Público Estadual por Prédio</h3>
            <p className="text-sm text-slate-600">
              Configure quais prédios vinculados aos entes públicos devem ser tratados como ente público do Estado.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            <Building2 size={14} />
            Cadastro ativo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="form-label">
            Ente Público
            <select
              className="form-input mt-1"
              value={empresaFiltro}
              onChange={(event) => setEmpresaFiltro(event.target.value)}
            >
              <option value="">Selecione um ente público</option>
              {empresas.map((empresa) => (
                <option key={empresa.codigo} value={empresa.codigo}>
                  {empresa.descricao} ({empresa.codigo})
                </option>
              ))}
            </select>
          </label>

          <label className="form-label md:col-span-2">
            Buscar ente público/prédio
            <div className="relative mt-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="form-input pl-9"
                value={termo}
                onChange={(event) => setTermo(event.target.value)}
                placeholder="Digite nome/código do ente público ou do prédio"
                disabled={!empresaFiltro}
              />
            </div>
          </label>
        </div>

        {error ? <div className="alert-error">{error}</div> : null}
        {success ? <div className="alert-success">{success}</div> : null}

        {empresaFiltro ? (
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-600">
              Ações em lote aplicadas aos registros exibidos do ente público selecionado.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 text-xs"
                disabled={savingBatch || !podeMarcarTodos}
                onClick={() => aplicarEstadoEmLote(true)}
              >
                Marcar todos
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 text-xs"
                disabled={savingBatch || !podeDesmarcarTodos}
                onClick={() => aplicarEstadoEmLote(false)}
              >
                Desmarcar todos
              </button>
              <button
                type="button"
                className="btn-primary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                disabled={savingBatch || itensFiltradosAlterados.length === 0}
                onClick={() => void saveBatch()}
              >
                <Save size={14} />
                {savingBatch ? 'Salvando manutenção...' : `Salvar manutenção (${itensFiltradosAlterados.length})`}
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-5">
          <section className="space-y-2">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Marcados como É do Estado</h4>
            {renderTabela(itensDoEstado, 'Nenhum prédio marcado como É do Estado.')}
          </section>

          {!empresaFiltro && !loading ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              Selecione um ente público para carregar os prédios.
            </div>
          ) : (
            <section ref={gradeResultadosRef} tabIndex={-1} className="space-y-2 focus:outline-none">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Demais prédios</h4>
              {renderTabela(itensDemais, 'Nenhum prédio restante para os filtros aplicados.')}
            </section>
          )}
        </div>
      </article>
    </section>
  );
}

