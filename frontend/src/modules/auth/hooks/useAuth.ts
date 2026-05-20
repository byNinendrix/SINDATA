import { useMemo } from 'react';

const TOKEN_KEY = 'sindata_token';
const USER_KEY = 'sindata_user';

export function saveAuth(token: string, user: { login: string }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function useAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  const user = useMemo(() => {
    if (!userRaw) {
      return null;
    }

    try {
      return JSON.parse(userRaw) as { login: string };
    } catch {
      return null;
    }
  }, [userRaw]);

  return {
    token,
    user,
    isAuthenticated: Boolean(token)
  };
}
