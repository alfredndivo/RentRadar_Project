import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner'; // ✅ Correct for displaying toasts with sonner
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './index.css';
import { registerServiceWorker, preloadCriticalResources } from './utils/performanceOptimizer';

// Initialize performance optimizations
preloadCriticalResources();
registerServiceWorker();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right" 
          richColors 
          theme="system"
          toastOptions={{
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              border: '1px solid var(--toast-border)',
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
