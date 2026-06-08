export interface FileInfo {
  name: string;
  path: string;
  lang: string;
  loc: number;
  code: number;
  comments: number;
  blanks: number;
  sizeBytes: number;
  complexity: number;
}

export interface LanguageStats {
  name: string;
  files: number;
  code: number;
  comments: number;
  blanks: number;
  pct: number;
}

export interface ProjectSummary {
  path: string;
  totalFiles: number;
  totalLanguages: number;
  totalCode: number;
  totalComments: number;
  totalBlanks: number;
  totalLoc: number;
  languages: LanguageStats[];
  files: FileInfo[];
  duplicates: number;
  duplicateGroups: string[][];
  averageComplexity: number;
  complexityDist: number[];
  edges: [string, string][];
  scanDurationMs: number;
}

export interface CocomoResult {
  effortPersonMonths: number;
  developmentTimeMonths: number;
  estimatedCostUsd: number;
  teamSize: number;
}
