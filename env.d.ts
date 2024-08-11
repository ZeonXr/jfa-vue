/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROXY_PREFIX: string
  readonly SERVER_PORT: string
}

declare namespace NodeJS {
  type ProcessEnv = ImportMetaEnv
}
