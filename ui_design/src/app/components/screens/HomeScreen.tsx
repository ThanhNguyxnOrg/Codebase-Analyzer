import { Archive, ArrowRight, CheckCircle2, Clock, Cpu, FolderOpen, Monitor } from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";
import { DEFAULT_IGNORES, SUPPORTED_LANGUAGES } from "../../lib/analysisEngine";
import { detectOS, shortcut } from "../../utils/platform";

export function HomeScreen({ onAnalyze, onDashboard }: { onAnalyze: () => void; onDashboard: () => void }) {
  const { result, repositorySnapshot, runRepositoryAnalysis, analyzing, progress } = useAnalysis();
  const os = detectOS();
  const visibleFiles = result
    ? result.files.slice(0, 8).map((file) => ({ path: file.file, total: file.total }))
    : repositorySnapshot.files.slice(0, 8).map((file) => ({ path: file.path, total: null }));
  const totalLines = result?.files.reduce((sum, file) => sum + file.total, 0) ?? countSnapshotLines(repositorySnapshot.files);
  const codeLines = result?.files.reduce((sum, file) => sum + file.code, 0) ?? null;

  const analyzeRepository = async () => {
    try {
      await runRepositoryAnalysis(DEFAULT_IGNORES);
      onDashboard();
    } catch {
      // surfaced through context error state
    }
  };

  return (
    <div className="h-full overflow-auto bg-[#070a0f]">
      <div className="max-w-[980px] mx-auto px-8 py-10">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#5b687f] mb-1.5">// local.static-analysis</div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#f3f4f6]">Codebase Analyzer</h1>
            <p className="text-[13px] text-[#8a99ad] mt-1">Scan source folders, inspect language mix, and export a reproducible report.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge active={os === "windows"}>Windows</Badge>
            <Badge active={os === "macos"}>macOS</Badge>
            <Badge active={os === "linux"}>Linux</Badge>
          </div>
        </div>

        <div className="grid grid-cols-[1.2fr_0.8fr] gap-5">
          <div className="rounded-lg border border-[#1e2430] bg-[#0c1017] shadow-lg">
            <div className="px-4 py-2.5 border-b border-[#1e2430] flex items-center justify-between bg-[#090d14]">
              <div className="text-[10px] font-mono text-[#5b687f]">workspace.actions</div>
              <div className="text-[9px] font-mono text-[#4b5563]">{shortcut("O")}</div>
            </div>
            <div className="p-5">
              <div className="font-mono text-[11px] text-[#8a99ad] leading-relaxed mb-6 bg-[#070a0f] p-4 rounded border border-[#161b24]">
                <div><span className="text-[#5f8cff]">$</span> analyzer --source {repositorySnapshot.rootName}</div>
                <div className="text-[#5b687f]"><span className="text-emerald-500">ok</span> parsers: {SUPPORTED_LANGUAGES.join(", ")}</div>
                <div className="text-[#5b687f]"><span className="text-emerald-500">ok</span> repository snapshot: {repositorySnapshot.files.length} source files</div>
                <div className="text-[#5b687f]"><span className="text-amber-500">run</span> branch: {repositorySnapshot.gitBranch}</div>
              </div>

              <button
                onClick={analyzeRepository}
                disabled={analyzing}
                className="w-full group flex items-center justify-between px-4 py-2.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-[0_0_0_1px_#3b82f6_inset] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Archive size={14} />
                  <span className="text-[13px] font-medium">Analyze This Repository</span>
                </span>
                <span className="flex items-center gap-1.5 text-[9px] font-mono text-white/80">
                  {analyzing ? `${progress}%` : "snapshot"} <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>

              <button
                onClick={onAnalyze}
                disabled={analyzing}
                className="w-full mt-2 flex items-center justify-between px-4 py-2 rounded-md border border-[#1e2430] hover:border-[#2d3748] hover:bg-[#11151d] disabled:opacity-50 text-[#8a99ad] text-[12px] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2"><FolderOpen size={12} /> Choose Another Folder</span>
                <span className="text-[9px] font-mono text-[#5b687f]">{shortcut("O")}</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[#1e2430] bg-[#0c1017]">
            <div className="px-4 py-2.5 border-b border-[#1e2430] flex items-center justify-between bg-[#090d14]">
              <div className="text-[10px] font-mono text-[#5b687f]">latest.analysis</div>
              <div className="text-[9px] font-mono text-[#4b5563]">{result ? result.timestamp : "none"}</div>
            </div>
            {result ? (
              <button onClick={onDashboard} className="w-full text-left px-4 py-4 hover:bg-[#11151d] group cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-[#e5e7eb] group-hover:text-[#5f8cff] transition-colors">{result.path}</div>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <Metric label="files" value={String(result.files.length)} />
                  <Metric label="lines" value={String(result.files.reduce((sum, file) => sum + file.total, 0))} />
                  <Metric label="langs" value={String(result.langs.length)} />
                </div>
              </button>
            ) : (
              <div className="px-4 py-4 text-[12px] text-[#8a99ad]">
                <div className="flex items-center gap-2 text-[#cbd5e1]"><Clock size={13} /> No completed analysis yet</div>
                <div className="mt-2 font-mono text-[11px] text-[#5b687f]">Run the repository snapshot or choose a local folder.</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-[#1e2430] bg-[#0c1017] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#1e2430] flex items-center justify-between bg-[#090d14]">
            <div className="text-[10px] font-mono text-[#5b687f]">
              workspace.structure · {result?.path ?? repositorySnapshot.rootName}
            </div>
            <div className="text-[9px] font-mono text-[#4b5563]">{visibleFiles.length} shown</div>
          </div>
          <div className="grid grid-cols-2 font-mono text-[11px] text-[#8a99ad]">
            <div className="p-4 border-r border-[#1e2430] leading-[1.8] bg-[#080b11]">
              {visibleFiles.map((file, index) => (
                <div key={file.path} className="text-[#5b687f]">
                  {index < visibleFiles.length - 1 ? "├─" : "└─"} {file.path}{" "}
                  {file.total !== null && <span className="text-[#4b5563]">· {file.total} LOC</span>}
                </div>
              ))}
            </div>
            <div className="p-4 leading-[1.8] text-[11px] bg-[#0c1017]">
              <div className="text-[#4b5563]">// repository metrics</div>
              <div><span className="text-[#5f8cff]">source_files</span> = <span className="text-amber-300">{result?.files.length ?? repositorySnapshot.files.length}</span></div>
              <div><span className="text-[#5f8cff]">active_parsers</span> = <span className="text-emerald-300">{SUPPORTED_LANGUAGES.length}</span></div>
              <div><span className="text-[#5f8cff]">total_loc</span> = <span className="text-amber-300">{totalLines}</span></div>
              <div><span className="text-[#5f8cff]">code_loc</span> = <span className="text-amber-300">{codeLines ?? "run analysis"}</span></div>
              <div className="pt-2 flex items-center gap-2 text-[#4b5563]"><Monitor size={11} /> app source: web</div>
              <div className="flex items-center gap-2 text-[#4b5563]"><Cpu size={11} /> native core: C++23 CLI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
      active
        ? "border-[#3b82f6]/50 bg-[#3b82f6]/10 text-[#93b4ff]"
        : "border-[#1f2430] bg-[#0d1117] text-[#9ca3af]"
    }`}>
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#1f2430] bg-[#080b11] px-2 py-1">
      <div className="text-[#4b5563]">{label}</div>
      <div className="text-[#cbd5e1]">{value}</div>
    </div>
  );
}

function countSnapshotLines(files: Array<{ text: string }>) {
  return files.reduce((sum, file) => {
    if (!file.text) return sum;
    const normalized = file.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = normalized.endsWith("\n") ? normalized.slice(0, -1).split("\n") : normalized.split("\n");
    return sum + lines.length;
  }, 0);
}
