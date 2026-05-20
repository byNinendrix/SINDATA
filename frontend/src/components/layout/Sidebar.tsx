import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  X
} from 'lucide-react';

const items = [
  { label: 'Visao Geral', icon: LayoutDashboard },
  { label: 'Filiados', icon: Users },
  { label: 'Financeiro', icon: Wallet },
  { label: 'Relatorios', icon: FileText },
  { label: 'Dashboards', icon: BarChart3 },
  { label: 'Qualidade de Dados', icon: Database },
  { label: 'Exportacoes', icon: FileSpreadsheet },
  { label: 'Configuracoes', icon: Settings }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

function MenuItems({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <nav className={`space-y-1 py-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            className={`sidebar-item ${isCollapsed ? 'justify-center px-2' : ''} ${
              index === 0 ? 'bg-cyan-100/15 text-cyan-100' : ''
            }`}
            title={item.label}
          >
            <Icon size={18} />
            {!isCollapsed ? <span>{item.label}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      <aside
        className={`hidden shrink-0 border-r border-slate-700/20 bg-sindata-800 text-slate-100 transition-all duration-300 lg:block ${
          isCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        <div className={`border-b border-slate-700/30 ${isCollapsed ? 'px-3 py-4' : 'px-6 py-6'}`}>
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-100/30 bg-white/10 text-cyan-100 transition hover:bg-white/20"
              aria-label={isCollapsed ? 'Expandir menu lateral' : 'Ocultar menu lateral'}
              title={isCollapsed ? 'Expandir menu lateral' : 'Ocultar menu lateral'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <img src="/favicon.svg" alt="Coruja SINDATA" className="h-8 w-8 rounded-md" />
            {!isCollapsed ? (
              <div>
                <h1 className="text-xl font-bold">SINDATA</h1>
                <p className="mt-1 text-xs text-cyan-100/80">Inteligencia Sindical</p>
              </div>
            ) : null}
          </div>
        </div>

        <MenuItems isCollapsed={isCollapsed} />
      </aside>

      <div className={`fixed inset-0 z-40 lg:hidden ${isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <button
          type="button"
          aria-label="Fechar menu lateral"
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          className={`relative h-full w-72 border-r border-slate-700/20 bg-sindata-800 text-slate-100 shadow-xl transition-transform duration-300 ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-slate-700/30 px-5 py-5">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={onCloseMobile}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-100/30 bg-white/10 text-cyan-100 transition hover:bg-white/20"
                aria-label="Fechar menu lateral"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img src="/favicon.svg" alt="Coruja SINDATA" className="h-8 w-8 rounded-md" />
              <div>
                <h1 className="text-xl font-bold">SINDATA</h1>
                <p className="mt-1 text-xs text-cyan-100/80">Inteligencia Sindical</p>
              </div>
            </div>
          </div>

          <MenuItems isCollapsed={false} />
        </aside>
      </div>
    </>
  );
}
