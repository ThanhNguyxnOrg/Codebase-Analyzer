const fs = require("node:fs/promises");
const path = require("node:path");

const SUPPORTED_EXTENSIONS = new Set([
  ".c",
  ".cc",
  ".cpp",
  ".cxx",
  ".h",
  ".hh",
  ".hpp",
  ".hxx",
  ".py",
  ".java",
  ".cs",
  ".html",
  ".htm",
  ".css",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
]);

const IGNORED_DIRS = new Set([
  ".git",
  "build",
  "release",
  "bin",
  "dist",
  "node_modules",
  "venv",
  ".next",
  "coverage",
]);

async function collectSourceFiles(rootPath) {
  const files = [];
  await walkDirectory(rootPath, rootPath, files);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function walkDirectory(currentPath, rootPath, files) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) {
      await walkDirectory(fullPath, rootPath, files);
      continue;
    }

    if (!entry.isFile()) continue;

    const extension = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) continue;

    const [text, stat] = await Promise.all([
      fs.readFile(fullPath, "utf8"),
      fs.stat(fullPath),
    ]);

    files.push({
      path: path.relative(rootPath, fullPath).replace(/\\/g, "/"),
      text,
      size: stat.size,
    });
  }
}

module.exports = {
  SUPPORTED_EXTENSIONS,
  IGNORED_DIRS,
  collectSourceFiles,
};
