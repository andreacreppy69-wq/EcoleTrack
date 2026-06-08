/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE: string;
    readonly VITE_FEDAPAY_PUBLIC_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
