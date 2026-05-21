/// <reference types="vite/client" />

declare global {
  interface Window {
    codebaseAnalyzer?: {
      pickDirectory: () => Promise<{ rootPath: string; files: Array<{ path: string; text: string; size: number; lastModified?: number }> } | null>;
    };
  }
}
