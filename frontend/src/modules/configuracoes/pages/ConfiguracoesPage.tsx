import { useEffect, useMemo, useState } from 'react';
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [empresaFiltro, setEmpresaFiltro] = useState('');
  const [termo, setTermo] = useState('');
  const [items, setItems] = useState<EntePublicoOpcaoItem[]>([]);
  const [estadoDraft, setEstadoDraft] = useState<Record<string, boolean>>({});

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
        setError('Nao foi possivel carregar as configuracoes de ente publico.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

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

      setSuccess('Configuracao salva com sucesso.');
    } catch {
      setError('Nao foi possivel salvar a configuracao.');
    } finally {
      setSavingKey('');
    }
  }

  function renderTabela(itemsToRender: EntePublicoOpcaoItem[], emptyMessage: string) {
    return (
      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Empresa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Predio
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                E do Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Acao
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  Carregando opcoes de configuracao...
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
                      <div className="text-xs text-slate-500">Codigo: {item.codigoEmpresa}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <div className="font-medium text-slate-800">{item.descricaoPredio}</div>
                      <div className="text-xs text-slate-500">Codigo: {item.codigoPredio}</div>
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
                        <span>{checked ? 'Sim' : 'Nao'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="btn-secondary inline-flex items-center gap-1"
                        disabled={!changed || isSaving}
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
        <h2 className="text-3xl font-bold text-sindata-900">Configuracoes</h2>
        <p className="mt-1 text-slate-600">Definicoes de negocio para continuidade das regras do sistema.</p>
      </header>

      <article className="ds-card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Ente Publico Estadual por Predio</h3>
            <p className="text-sm text-slate-600">
              Configure quais predios vinculados as empresas devem ser tratados como ente publico do Estado.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            <Building2 size={14} />
            Cadastro ativo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="form-label">
            Empresa
            <select
              className="form-input mt-1"
              value={empresaFiltro}
              onChange={(event) => setEmpresaFiltro(event.target.value)}
            >
              <option value="">Selecione uma empresa</option>
              {empresas.map((empresa) => (
                <option key={empresa.codigo} value={empresa.codigo}>
                  {empresa.descricao} ({empresa.codigo})
                </option>
              ))}
            </select>
          </label>

          <label className="form-label md:col-span-2">
            Buscar empresa/predio
            <div className="relative mt-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="form-input pl-9"
                value={termo}
                onChange={(event) => setTermo(event.target.value)}
                placeholder="Digite nome/codigo da empresa ou do predio"
                disabled={!empresaFiltro}
              />
            </div>
          </label>
        </div>

        {error ? <div className="alert-error">{error}</div> : null}
        {success ? <div className="alert-success">{success}</div> : null}

        <div className="space-y-5">
          <section className="space-y-2">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Marcados como E do Estado</h4>
            {renderTabela(itensDoEstado, 'Nenhum predio marcado como E do Estado.')}
          </section>

          {!empresaFiltro && !loading ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              Selecione uma empresa para carregar os predios.
            </div>
          ) : (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Demais predios</h4>
              {renderTabela(itensDemais, 'Nenhum predio restante para os filtros aplicados.')}
            </section>
          )}
        </div>
      </article>
    </section>
  );
}
