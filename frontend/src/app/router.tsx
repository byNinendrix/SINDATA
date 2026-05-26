import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { ConfiguracoesPage } from '../modules/configuracoes/pages/ConfiguracoesPage';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: <LoginPage />
          }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />
          },
          {
            path: '/configuracoes',
            element: <ConfiguracoesPage />
          }
        ]
      }
    ]
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);
