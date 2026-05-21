import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <section className="hidden w-full flex-col justify-between bg-sindata-900 px-10 py-12 text-slate-100 lg:flex lg:w-1/2">
          <div>
            <div className="flex items-center gap-3">
              <img src="/favicon.svg" alt="Coruja SINDATA" className="h-9 w-9 rounded-md ring-1 ring-cyan-200/40" />
              <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">SINDATA</p>
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight">Inteligência Sindical</h1>
            <p className="mt-4 max-w-md text-slate-200/90">Conectado ao SGS - Sistema de Gestão Sindical.</p>
          </div>

          <div className="grid gap-4">
            <article className="rounded-2xl border border-cyan-200/20 bg-cyan-50/10 p-5">
              <h2 className="text-lg font-semibold text-cyan-100">Dashboards Estratégicos</h2>
              <p className="mt-1 text-sm text-slate-200/90">Visão rápida dos principais indicadores sindicais.</p>
            </article>
            <article className="rounded-2xl border border-cyan-200/20 bg-cyan-50/10 p-5">
              <h2 className="text-lg font-semibold text-cyan-100">Filtros Avançados</h2>
              <p className="mt-1 text-sm text-slate-200/90">Explore pessoas, filiações e financeiro com precisão.</p>
            </article>
            <article className="rounded-2xl border border-cyan-200/20 bg-cyan-50/10 p-5">
              <h2 className="text-lg font-semibold text-cyan-100">Inteligência Operacional</h2>
              <p className="mt-1 text-sm text-slate-200/90">Decisões orientadas por dados com base no SGS.</p>
            </article>
          </div>
        </section>

        <section className="flex w-full items-center justify-center p-5 sm:p-8 lg:w-1/2">
          <div className="mb-6 w-full max-w-md rounded-3xl bg-white/95 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="mb-8 text-center lg:hidden">
              <img src="/favicon.svg" alt="Coruja SINDATA" className="mx-auto mb-3 h-10 w-10 rounded-md" />
              <h1 className="text-2xl font-bold text-sindata-900">SINDATA</h1>
              <p className="text-sm text-slate-600">Inteligência Sindical</p>
            </div>
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}