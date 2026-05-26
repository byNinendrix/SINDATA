import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { createTabFromPath, getDefaultTab, normalizeStoredTabs, type AppTab } from '../../app/tabs';
import { AppTabsBar } from './AppTabsBar';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const tabsStorageKey = 'sindata_open_tabs_v1';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [openTabs, setOpenTabs] = useState<AppTab[]>(() => {
    if (typeof window === 'undefined') {
      return [getDefaultTab()];
    }

    try {
      const raw = window.sessionStorage.getItem(tabsStorageKey);
      if (!raw) {
        return [getDefaultTab()];
      }
      return normalizeStoredTabs(JSON.parse(raw));
    } catch {
      return [getDefaultTab()];
    }
  });

  useEffect(() => {
    setOpenTabs((current) => {
      if (current.some((tab) => tab.path === location.pathname)) {
        return current;
      }
      return [...current, createTabFromPath(location.pathname)];
    });
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.setItem(tabsStorageKey, JSON.stringify(openTabs));
  }, [openTabs]);

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  function handleSelectTab(path: string) {
    if (path !== location.pathname) {
      navigate(path);
    }
  }

  function handleCloseTab(path: string) {
    const targetIndex = openTabs.findIndex((tab) => tab.path === path);
    if (targetIndex < 0) {
      return;
    }

    const nextTabs = openTabs.filter((tab) => tab.path !== path);
    const normalizedTabs = nextTabs.length > 0 ? nextTabs : [getDefaultTab()];
    setOpenTabs(normalizedTabs);

    if (location.pathname === path) {
      const fallbackIndex = targetIndex > 0 ? targetIndex - 1 : 0;
      const fallbackPath = normalizedTabs[Math.min(fallbackIndex, normalizedTabs.length - 1)].path;
      navigate(fallbackPath);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onToggleMobileSidebar={() => setIsMobileSidebarOpen((value) => !value)} />
          <AppTabsBar
            tabs={openTabs}
            activePath={activePath}
            onSelect={handleSelectTab}
            onClose={handleCloseTab}
          />
          <main className="page-container animate-[fadeIn_260ms_ease-out]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
