import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../../modules/auth/hooks/useAuth';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
}

export function Topbar({ onToggleMobileSidebar }: TopbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
            type="button"
            onClick={onToggleMobileSidebar}
            aria-label="Abrir menu lateral"
          >
            <Menu size={18} />
          </button>
          <img src="/favicon.svg" alt="Coruja SINDATA" className="hidden h-7 w-7 rounded md:block" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">SINDATA - Inteligencia Sindical</h2>
            <p className="hidden text-xs text-slate-500 sm:block">Conectado ao SGS - Sistema de Gestao Sindical</p>
          </div>
        </div>

        <button type="button" onClick={handleLogout} className="btn-secondary inline-flex items-center gap-2">
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </header>
  );
}
