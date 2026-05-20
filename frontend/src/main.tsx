import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import './styles/index.css';

// Build marker to guarantee fresh asset hash after deployment updates.
(window as Window & { __SINDATA_BUILD__?: string }).__SINDATA_BUILD__ = '2026-05-20-02';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </React.StrictMode>
);
