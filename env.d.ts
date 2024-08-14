/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROXY_PREFIX: string
  readonly VITE_VITE_SERVER_PORT: string
  readonly VITE_JFA_API_URL: string
  readonly VITE_WX: string
}

declare namespace NodeJS {
  type ProcessEnv = ImportMetaEnv
}
