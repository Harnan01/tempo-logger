/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JIRA_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
