/// <reference types="vite/client" />

declare module "virtual:repo-snapshot" {
  import type { RepositorySnapshot } from "./app/lib/analysisEngine";

  export const repoSnapshot: RepositorySnapshot;
}
