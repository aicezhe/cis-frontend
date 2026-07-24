/// <reference types="vite/client" />

// Метка сборки, подставляется Vite (define в vite.config.ts) — для
// кэш-бастинга сидов /data/*.json.
declare const __BUILD_ID__: string;

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
