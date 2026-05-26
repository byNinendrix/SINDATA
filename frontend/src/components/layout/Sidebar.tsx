import {
  BarChart3,
  ChevronDown,
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
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MenuChild {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: typeof LayoutDashboard;
  path?: string;
  children?: MenuChild[];
}

const items: MenuItem[] = [
  { label: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Filiados', icon: Users },
  { label: 'Financeiro', icon: Wallet },
  { label: 'Relatórios', icon: FileText },
  { label: 'Dashboards', icon: BarChart3 },
  { label: 'Qualidade de Dados', icon: Database },
  { label: 'Exportações', icon: FileSpreadsheet },
  {
    label: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
    children: [{ label: 'Ente Público Estadual', path: '/configuracoes' }]
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface MenuItemsProps {
  isCollapsed: boolean;
  onCloseMobile?: () => void;
}

function MenuItems({ isCollapsed, onCloseMobile }: MenuItemsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  function isActive(path?: string) {
    if (!path) {
      return false;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  function go(path?: string) {
    if (!path) {
      return;
    }
    navigate(path);
    onCloseMobile?.();
  }

  function toggleGroup(label: string) {
    setOpenGroups((current) => ({
      ...current,
      [label]: !current[label]
    }));
  }

  return (
    <nav className={`space-y-1 py-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        const isGroupOpen = openGroups[item.label] ?? true;

        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => go(item.path)}
                className={`sidebar-item flex-1 ${isCollapsed ? 'justify-center px-2' : ''} ${
                  active ? 'bg-cyan-100/15 text-cyan-100' : ''
                } ${item.path ? '' : 'cursor-default opacity-80'}`}
                title={item.label}
              >
                <Icon size={18} />
                {!isCollapsed ? <span>{item.label}</span> : null}
              </button>

              {!isCollapsed && item.children?.length ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(item.label)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-sindata-900/40 hover:text-cyan-100"
                  aria-label={isGroupOpen ? `Ocultar submenu ${item.label}` : `Exibir submenu ${item.label}`}
                  title={isGroupOpen ? 'Ocultar submenu' : 'Exibir submenu'}
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isGroupOpen ? '' : '-rotate-90'}`}
                  />
                </button>
              ) : null}
            </div>

            {!isCollapsed && item.children?.length && isGroupOpen ? (
              <div className="ml-9 space-y-1 border-l border-slate-600/50 pl-3">
                {item.children.map((child) => {
                  const childActive = isActive(child.path);
                  return (
                    <button
                      key={child.path}
                      type="button"
                      onClick={() => go(child.path)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${
                        childActive
                          ? 'bg-cyan-100/15 font-semibold text-cyan-100'
                          : 'text-slate-300 hover:bg-sindata-900/40 hover:text-cyan-100'
                      }`}
                    >
                      <ChevronRight size={12} />
                      <span>{child.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
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
                <p className="mt-1 text-xs text-cyan-100/80">Inteligência Sindical</p>
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
                <p className="mt-1 text-xs text-cyan-100/80">Inteligência Sindical</p>
              </div>
            </div>
          </div>

          <MenuItems isCollapsed={false} onCloseMobile={onCloseMobile} />
        </aside>
      </div>
    </>
  );
}
