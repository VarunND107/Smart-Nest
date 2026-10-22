interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://<project-ref>.supabase.co */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anon (publishable) key. Safe for the browser; RLS enforces access. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
