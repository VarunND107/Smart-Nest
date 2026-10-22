import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type Tone = 'success' | 'error' | 'info'
interface Toast {
  id: number
  tone: Tone
  message: string
}

interface ToastApi {
  success(message: string): void
  error(message: string): void
  info(message: string): void
}

const ToastContext = createContext<ToastApi | null>(null)

const toneClass: Record<Tone, string> = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  error: 'border-red-300 bg-red-50 text-red-950',
  info: 'border-slate-300 bg-white text-slate-900',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback(
    (tone: Tone, message: string) => {
      const id = nextId.current++
      setToasts((t) => [...t.slice(-3), { id, tone, message }])
      setTimeout(() => dismiss(id), tone === 'error' ? 8000 : 5000)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* A polite live region: screen readers announce toasts without stealing focus. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-md ${toneClass[t.tone]}`}
          >
            <p className="flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="-mr-1 rounded px-1 text-lg leading-none text-slate-600 hover:text-slate-900"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
