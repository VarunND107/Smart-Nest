import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { ToastProvider } from './components/toast'
import './index.css'
import { ApiError } from './lib/api'
import { AuthProvider } from './lib/auth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retry only transient trouble (a sleeping server), never a clear answer like 401/403/404/400.
      retry: (failures, err) => err instanceof ApiError && err.isNetwork && failures < 1,
      // Re-fetch when the tab regains focus, so updates made elsewhere (e.g. by support) appear.
      refetchOnWindowFocus: true,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
