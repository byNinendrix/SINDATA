export interface AppTab {
  path: string;
  label: string;
  closable: boolean;
}

interface AppTabDefinition {
  path: string;
  label: string;
  matchMode: 'exact' | 'prefix';
}

const defaultTab: AppTabDefinition = {
  path: '/dashboard',
  label: 'Visao Geral',
  matchMode: 'exact'
};

const definitions: AppTabDefinition[] = [
  defaultTab,
  {
    path: '/configuracoes',
    label: 'Ente Público Estadual',
    matchMode: 'exact'
  },
  {
    path: '/relatorios/gerador',
    label: 'Gerador de Relatorios',
    matchMode: 'exact'
  },
  {
    path: '/relatorios/modelos',
    label: 'Modelos Salvos',
    matchMode: 'exact'
  }
];

function humanizePath(pathname: string): string {
  const clean = pathname.trim().replace(/^\/+/, '');
  if (!clean) {
    return defaultTab.label;
  }

  return clean
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      segment
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(' / ');
}

function findDefinition(pathname: string): AppTabDefinition | null {
  const exact = definitions.find((item) => item.matchMode === 'exact' && item.path === pathname);
  if (exact) {
    return exact;
  }

  const prefix = definitions.find(
    (item) => item.matchMode === 'prefix' && (pathname === item.path || pathname.startsWith(`${item.path}/`))
  );
  return prefix ?? null;
}

export function getDefaultTab(): AppTab {
  return {
    path: defaultTab.path,
    label: defaultTab.label,
    closable: false
  };
}

export function createTabFromPath(pathname: string): AppTab {
  const definition = findDefinition(pathname);
  const label = definition?.label ?? humanizePath(pathname);
  return {
    path: pathname,
    label,
    closable: pathname !== defaultTab.path
  };
}

export function normalizeStoredTabs(value: unknown): AppTab[] {
  if (!Array.isArray(value)) {
    return [getDefaultTab()];
  }

  const result: AppTab[] = [];
  for (const row of value) {
    if (!row || typeof row !== 'object') {
      continue;
    }

    const path = String((row as { path?: unknown }).path ?? '').trim();
    if (!path.startsWith('/')) {
      continue;
    }

    const tab = createTabFromPath(path);
    if (!result.some((item) => item.path === tab.path)) {
      result.push(tab);
    }
  }

  if (!result.some((item) => item.path === defaultTab.path)) {
    result.unshift(getDefaultTab());
  }

  return result.length > 0 ? result : [getDefaultTab()];
}
