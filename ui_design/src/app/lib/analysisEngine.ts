export type LangStat = {
  name: string;
  files: number;
  lines: number;
  code: number;
  comments: number;
  blanks: number;
  color: string;
};

export type FileRow = {
  file: string;
  lang: string;
  total: number;
  code: number;
  comments: number;
  blanks: number;
  color: string;
  size: number;
};

export type AnalysisResult = {
  path: string;
  timestamp: string;
  elapsed: string;
  source: "repository" | "directory" | "upload";
  langs: LangStat[];
  files: FileRow[];
  ignoredFiles: number;
  unsupportedFiles: number;
  ignores: string[];
};

export type LogEntry = {
  time: string;
  kind: "scan" | "info" | "parse" | "ok" | "err";
  message: string;
};

export type SourceFile = {
  path: string;
  text: string;
  size: number;
  lastModified?: number;
};

export type RepositorySnapshot = {
  rootName: string;
  rootPath: string;
  generatedAt: string;
  gitBranch: string;
  files: SourceFile[];
};

type AnalyzeOptions = {
  path: string;
  source: AnalysisResult["source"];
  files: SourceFile[];
  ignores: string[];
  onLog?: (kind: LogEntry["kind"], message: string) => void;
  onProgress?: (value: number) => void;
};

type Counter = {
  total: number;
  code: number;
  comments: number;
  blanks: number;
};

type LanguageSpec = {
  name: string;
  extensions: string[];
  color: string;
  kind: "cLike" | "css" | "html" | "python";
};

export const DEFAULT_IGNORES = [".git", "build", "node_modules", "bin", "dist", "venv", ".next", "coverage"];

const LANGUAGE_SPECS: LanguageSpec[] = [
  { name: "C++", extensions: [".cpp", ".cxx", ".cc", ".hpp", ".hxx", ".hh"], color: "#4f8cff", kind: "cLike" },
  { name: "C", extensions: [".c", ".h"], color: "#8b949e", kind: "cLike" },
  { name: "Python", extensions: [".py"], color: "#ffd43b", kind: "python" },
  { name: "Java", extensions: [".java"], color: "#f89820", kind: "cLike" },
  { name: "C#", extensions: [".cs"], color: "#7c3aed", kind: "cLike" },
  { name: "HTML", extensions: [".html", ".htm"], color: "#e34c26", kind: "html" },
  { name: "CSS", extensions: [".css"], color: "#38bdf8", kind: "css" },
  { name: "JavaScript", extensions: [".js", ".jsx", ".mjs", ".cjs"], color: "#f7df1e", kind: "cLike" },
  { name: "TypeScript", extensions: [".ts", ".tsx", ".mts", ".cts"], color: "#3178c6", kind: "cLike" },
];

export const SUPPORTED_LANGUAGES = LANGUAGE_SPECS.map((spec) => spec.name);

const LANGUAGE_BY_EXT = new Map<string, LanguageSpec>(
  LANGUAGE_SPECS.flatMap((spec) => spec.extensions.map((ext) => [ext, spec] as const)),
);

export function canUseDirectoryPicker() {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export function detectLanguage(filePath: string): LanguageSpec | null {
  const cleanPath = normalizePath(filePath).toLowerCase();
  const dot = cleanPath.lastIndexOf(".");
  if (dot < 0) return null;
  return LANGUAGE_BY_EXT.get(cleanPath.slice(dot)) ?? null;
}

export async function analyzeSources(options: AnalyzeOptions): Promise<AnalysisResult> {
  const started = performance.now();
  const ignores = normalizeIgnores(options.ignores);
  const rows: FileRow[] = [];
  let ignoredFiles = 0;
  let unsupportedFiles = 0;

  options.onProgress?.(4);
  options.onLog?.("scan", `Loaded ${options.files.length} files from ${options.path}`);

  for (let index = 0; index < options.files.length; index++) {
    const sourceFile = options.files[index];
    const filePath = normalizePath(sourceFile.path);

    if (isIgnored(filePath, ignores)) {
      ignoredFiles++;
      continue;
    }

    const spec = detectLanguage(filePath);
    if (!spec) {
      unsupportedFiles++;
      continue;
    }

    const counts = countLines(sourceFile.text, spec.kind);
    rows.push({
      file: filePath,
      lang: spec.name,
      total: counts.total,
      code: counts.code,
      comments: counts.comments,
      blanks: counts.blanks,
      color: spec.color,
      size: sourceFile.size,
    });

    if (index % 15 === 0 || index === options.files.length - 1) {
      const progress = Math.min(96, 8 + Math.round(((index + 1) / Math.max(options.files.length, 1)) * 84));
      options.onProgress?.(progress);
    }
  }

  rows.sort((a, b) => b.total - a.total || a.file.localeCompare(b.file));

  const langs = aggregateLanguages(rows);
  for (const lang of langs) {
    options.onLog?.("parse", `${lang.name}: ${lang.files} files, ${lang.lines} lines`);
  }

  const elapsed = ((performance.now() - started) / 1000).toFixed(2);
  options.onProgress?.(100);
  options.onLog?.("ok", `Analysis completed in ${elapsed}s with ${rows.length} supported files`);

  return {
    path: options.path,
    timestamp: formatTimestamp(new Date()),
    elapsed,
    source: options.source,
    langs,
    files: rows,
    ignoredFiles,
    unsupportedFiles,
    ignores,
  };
}

export async function collectDirectoryFiles(ignores: string[], onLog?: (kind: LogEntry["kind"], message: string) => void) {
  if (!canUseDirectoryPicker()) {
    throw new Error("Directory picker is not available in this browser.");
  }

  const picker = (window as Window & { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker;
  const root = await picker.call(window);
  const files: SourceFile[] = [];
  const normalizedIgnores = normalizeIgnores(ignores);

  onLog?.("scan", `Reading ${root.name}`);
  await walkDirectoryHandle(root, "", normalizedIgnores, files);
  return { rootPath: root.name, files };
}

export async function collectUploadedFiles(fileList: FileList): Promise<{ rootPath: string; files: SourceFile[] }> {
  const files = await Promise.all(
    Array.from(fileList).map(async (file) => {
      const relativePath = normalizePath((file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name);
      return {
        path: relativePath,
        text: await file.text(),
        size: file.size,
        lastModified: file.lastModified,
      };
    }),
  );

  const firstPath = files[0]?.path ?? "uploaded-folder";
  const rootPath = firstPath.includes("/") ? firstPath.split("/")[0] : "uploaded-folder";
  return { rootPath, files };
}

function aggregateLanguages(rows: FileRow[]): LangStat[] {
  const byLanguage = new Map<string, LangStat>();

  for (const row of rows) {
    const existing = byLanguage.get(row.lang);
    if (existing) {
      existing.files++;
      existing.lines += row.total;
      existing.code += row.code;
      existing.comments += row.comments;
      existing.blanks += row.blanks;
    } else {
      byLanguage.set(row.lang, {
        name: row.lang,
        files: 1,
        lines: row.total,
        code: row.code,
        comments: row.comments,
        blanks: row.blanks,
        color: row.color,
      });
    }
  }

  return Array.from(byLanguage.values()).sort((a, b) => b.lines - a.lines || a.name.localeCompare(b.name));
}

function countLines(text: string, kind: LanguageSpec["kind"]): Counter {
  if (text.length === 0) return { total: 0, code: 0, comments: 0, blanks: 0 };

  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  if (lines.at(-1) === "") lines.pop();

  if (kind === "python") return countPython(lines);
  if (kind === "html") return countBlockOnly(lines, "<!--", "-->");
  if (kind === "css") return countBlockOnly(lines, "/*", "*/");
  return countCLike(lines);
}

function countCLike(lines: string[]): Counter {
  const counter = emptyCounter();
  let inBlockComment = false;

  for (const raw of lines) {
    const line = raw.trim();
    countLine(counter, line, () => {
      if (inBlockComment) {
        const end = line.indexOf("*/");
        if (end >= 0) {
          inBlockComment = false;
          return line.slice(end + 2).trim().length === 0;
        }
        return true;
      }

      if (line.startsWith("/*")) {
        const end = line.indexOf("*/");
        if (end < 0) {
          inBlockComment = true;
          return true;
        }
        return line.slice(end + 2).trim().length === 0;
      }

      return line.startsWith("//");
    });
  }

  return finalizeCounter(counter);
}

function countBlockOnly(lines: string[], startToken: string, endToken: string): Counter {
  const counter = emptyCounter();
  let inBlockComment = false;

  for (const raw of lines) {
    const line = raw.trim();
    countLine(counter, line, () => {
      if (inBlockComment) {
        const end = line.indexOf(endToken);
        if (end >= 0) {
          inBlockComment = false;
          return line.slice(end + endToken.length).trim().length === 0;
        }
        return true;
      }

      if (line.startsWith(startToken)) {
        const end = line.indexOf(endToken, startToken.length);
        if (end < 0) {
          inBlockComment = true;
          return true;
        }
        return line.slice(end + endToken.length).trim().length === 0;
      }

      return false;
    });
  }

  return finalizeCounter(counter);
}

function countPython(lines: string[]): Counter {
  const counter = emptyCounter();
  let inTripleSingle = false;
  let inTripleDouble = false;

  for (const raw of lines) {
    const line = raw.trim();
    countLine(counter, line, () => {
      if (inTripleDouble) {
        const end = line.indexOf('"""');
        if (end >= 0) {
          inTripleDouble = false;
          return line.slice(end + 3).trim().length === 0;
        }
        return true;
      }

      if (inTripleSingle) {
        const end = line.indexOf("'''");
        if (end >= 0) {
          inTripleSingle = false;
          return line.slice(end + 3).trim().length === 0;
        }
        return true;
      }

      if (line.startsWith('"""')) {
        const end = line.indexOf('"""', 3);
        if (end < 0) {
          inTripleDouble = true;
          return true;
        }
        return line.slice(end + 3).trim().length === 0;
      }

      if (line.startsWith("'''")) {
        const end = line.indexOf("'''", 3);
        if (end < 0) {
          inTripleSingle = true;
          return true;
        }
        return line.slice(end + 3).trim().length === 0;
      }

      return line.startsWith("#");
    });
  }

  return finalizeCounter(counter);
}

function countLine(counter: Counter, line: string, isComment: () => boolean) {
  if (line.length === 0) {
    counter.blanks++;
  } else if (isComment()) {
    counter.comments++;
  } else {
    counter.code++;
  }
}

function emptyCounter(): Counter {
  return { total: 0, code: 0, comments: 0, blanks: 0 };
}

function finalizeCounter(counter: Counter): Counter {
  counter.total = counter.code + counter.comments + counter.blanks;
  return counter;
}

function normalizeIgnores(ignores: string[]) {
  return ignores.map((rule) => rule.trim()).filter(Boolean);
}

function isIgnored(filePath: string, ignores: string[]) {
  const path = normalizePath(filePath);
  const segments = path.split("/");

  return ignores.some((rule) => {
    const normalizedRule = normalizePath(rule);
    if (segments.includes(normalizedRule)) return true;
    if (path === normalizedRule || path.startsWith(`${normalizedRule}/`)) return true;
    if (path.includes(`/${normalizedRule}/`)) return true;
    if (normalizedRule.includes("*")) return wildcardToRegExp(normalizedRule).test(path);
    return false;
  });
}

function wildcardToRegExp(pattern: string) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`(^|/)${escaped}($|/)`);
}

async function walkDirectoryHandle(
  directory: FileSystemDirectoryHandle,
  basePath: string,
  ignores: string[],
  files: SourceFile[],
) {
  for await (const [name, handle] of directory.entries()) {
    const relativePath = basePath ? `${basePath}/${name}` : name;
    if (isIgnored(relativePath, ignores)) continue;

    if (handle.kind === "directory") {
      await walkDirectoryHandle(handle, relativePath, ignores, files);
      continue;
    }

    if (handle.kind === "file") {
      const language = detectLanguage(relativePath);
      if (!language) continue;
      const file = await handle.getFile();
      files.push({
        path: relativePath,
        text: await file.text(),
        size: file.size,
        lastModified: file.lastModified,
      });
    }
  }
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}

function formatTimestamp(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
