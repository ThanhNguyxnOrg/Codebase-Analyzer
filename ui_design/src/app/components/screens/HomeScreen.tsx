import type { ReactNode } from "react";
import { ArrowRight, BarChart3, CheckCircle2, Clock, Cpu, FileCode2, FolderOpen, Monitor, ShieldCheck } from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";
import { SUPPORTED_LANGUAGES } from "../../lib/analysisEngine";
import { detectOS } from "../../utils/platform";

export function HomeScreen({ onAnalyze, onDashboard }: { onAnalyze: () => void; onDashboard: () => void }) {
  const { result, analyzing } = useAnalysis();
  const os = detectOS();

  const totalFiles = result?.files.length ?? 0;
  const totalLines = result?.files.reduce((sum, file) => sum + file.total, 0) ?? 0;
  const totalCode = result?.files.reduce((sum, file) => sum + file.code, 0) ?? 0;
  const totalLangs = result?.langs.length ?? 0;
  const visibleFiles = result?.files.slice(0, 8) ?? [];

  return (
    <div className="h-full overflow-auto bg-[#070a0f]">
      <div className="max-w-[1080px] mx-auto px-8 py-10">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#5b687f] mb-1.5">// local code intelligence</div>
            <h1 className="text-[30px] font-bold tracking-tight text-[#f3f4f6]">Codebase Analyzer</h1>
            <p className="text-[13px] text-[#8a99ad] mt-2 max-w-[620px]">
              Select a source folder, analyze code structure, inspect language distribution, and export a clean report.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge active={os === "windows"}>Windows</Badge>
            <Badge active={os === "macos"}>macOS</Badge>
            <Badge active={os === "linux"}>Linux</Badge>
          </div>
        </div>

        <div className="grid grid-cols-[1.15fr_0.85fr] gap-5">
          <div className="rounded-xl border border-[#1e2430] bg-[#0c1017] shadow-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1e2430] flex items-center justify-between bg-[#090d14]">
              <div className="text-[10px] font-mono text-[#5b687f]">start.analysis</div>
              <div className="text-[9px] font-mono text-[#4b5563]">local-first</div>
            </div>
            <div className="p-5">
              <div className="rounded-lg border border-[#161b24] bg-[#070a0f] p-4 font-mono text-[11px] leading-relaxed mb-5">
                <div><span className="text-[#5f8cff]">$</span> analyzer --source <span className="text-[#8a99ad]">choose-folder</span></div>
                <div className="text-[#5b687f]"><span className="text-amber-400">idle</span> waiting for a workspace</div>
                <div className="text-[#5b687f]"><span className="text-emerald-500">ok</span> parsers: {SUPPORTED_LANGUAGES.join(", ")}</div>
                <div className="text-[#5b687f]"><span className="text-emerald-500">ok</span> output: dashboard + markdown report</div>
              </div>

              <button
                onClick={onAnalyze}
                disabled={analyzing}
                className="w-full group flex items-center justify-between px-4 py-3 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-[0_0_0_1px_#3b82f6_inset] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FolderOpen size={15} />
                  <span className="text-[13px] font-medium">Choose Source Folder</span>
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/80">
                  start <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#1e2430] bg-[#0c1017] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1e2430] flex items-center justify-between bg-[#090d14]">
              <div className="text-[10px] font-mono text-[#5b687f]">current.session</div>
              <div className="text-[9px] font-mono text-[#4b5563]">{result ? result.timestamp : "not started"}</div>
            </div>
            {result ? (
              <button onClick={onDashboard} className="w-full text-left p-5 hover:bg-[#11151d] group cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-[13px] text-[#e5e7eb] group-hover:text-[#5f8cff] transition-colors truncate">{result.path}</div>
                    <div className="text-[11px] text-[#5b687f] mt-1">Analysis completed in {result.elapsed}s</div>
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <Metric label="files" value={String(totalFiles)} />
                  <Metric label="lines" value={String(totalLines)} />
                  <Metric label="langs" value={String(totalLangs)} />
                </div>
              </button>
            ) : (
              <div className="p-5 text-[12px] text-[#8a99ad]">
                <div className="flex items-center gap-2 text-[#cbd5e1]"><Clock size={14} /> No workspace analyzed yet</div>
                <div className="mt-2 text-[#5b687f] leading-relaxed">
                  Choose a local project folder to unlock dashboard metrics, file tables, and report export.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5">
          <Feature icon={<ShieldCheck size={16} />} title="Local-first" text="Files are read from your selected folder and processed on the device." />
          <Feature icon={<FileCode2 size={16} />} title="Multi-language" text="C, C++, Python, Java, C#, HTML, CSS, JavaScript, and TypeScript." />
          <Feature icon={<BarChart3 size={16} />} title="Report-ready" text="Generate statistics for slides, documentation, and Markdown reports." />
        </div>

        <div className="mt-5 rounded-xl border border-[#1e2430] bg-[#0c1017] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e2430] flex items-center justify-between bg-[#090d14]">
            <div className="text-[10px] font-mono text-[#5b687f]">workspace.preview</div>
            <div className="text-[9px] font-mono text-[#4b5563]">{result ? `${visibleFiles.length} shown` : "empty"}</div>
          </div>
          {result ? (
            <div className="grid grid-cols-2 font-mono text-[11px] text-[#8a99ad]">
              <div className="p-4 border-r border-[#1e2430] leading-[1.8] bg-[#080b11]">
                {visibleFiles.map((file, index) => (
                  <div key={file.file} className="text-[#5b687f]">
                    {index < visibleFiles.length - 1 ? "├─" : "└─"} {file.file}{" "}
                    <span className="text-[#4b5563]">· {file.total} LOC</span>
                  </div>
                ))}
              </div>
              <div className="p-4 leading-[1.8] text-[11px] bg-[#0c1017]">
                <div className="text-[#4b5563]">// repository metrics</div>
                <div><span className="text-[#5f8cff]">source_files</span> = <span className="text-amber-300">{totalFiles}</span></div>
                <div><span className="text-[#5f8cff]">active_parsers</span> = <span className="text-emerald-300">{SUPPORTED_LANGUAGES.length}</span></div>
                <div><span className="text-[#5f8cff]">total_loc</span> = <span className="text-amber-300">{totalLines}</span></div>
                <div><span className="text-[#5f8cff]">code_loc</span> = <span className="text-amber-300">{totalCode}</span></div>
                <div className="pt-2 flex items-center gap-2 text-[#4b5563]"><Monitor size={11} /> app source: web renderer</div>
                <div className="flex items-center gap-2 text-[#4b5563]"><Cpu size={11} /> desktop shell: Electron</div>
              </div>
            </div>
          ) : (
            <div className="p-8 flex items-center justify-center text-center">
              <div>
                <div className="mx-auto w-11 h-11 rounded-xl border border-[#1e2430] bg-[#090d14] flex items-center justify-center text-[#7c9cff] mb-3">
                  <FolderOpen size={20} />
                </div>
                <div className="text-[14px] text-[#e5e7eb]">No folder selected</div>
                <div className="text-[12px] text-[#5b687f] mt-1 max-w-[380px]">
                  The file tree and metrics will appear here after the first analysis.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, active }: { children: ReactNode; active?: boolean }) {
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

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-[#1e2430] bg-[#0c1017] p-4">
      <div className="flex items-center gap-2 text-[#cbd5e1] text-[13px]">
        <span className="text-[#7c9cff]">{icon}</span>
        {title}
      </div>
      <div className="text-[12px] text-[#5b687f] leading-relaxed mt-2">{text}</div>
    </div>
  );
}
