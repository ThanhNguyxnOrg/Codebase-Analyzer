/// <reference types="vite/client" />

declare module "virtual:repo-snapshot" {
  import type { RepositorySnapshot } from "./app/lib/analysisEngine";

  export const repoSnapshot: RepositorySnapshot;
}

declare global {
  interface Window {
    codebaseAnalyzer?: {
      pickDirectory: () => Promise<{ rootPath: string; files: Array<{ path: string; text: string; size: number; lastModified?: number }> } | null>;
    };
  }
}
