/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_OPENAI_API_KEY: string;
  readonly MAIN_VITE_GEMINI_API_KEY: string;
  readonly RENDERER_VITE_API_URL: string;
  readonly VITE_KEY: string;
  // plus de variables d'environnement...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
