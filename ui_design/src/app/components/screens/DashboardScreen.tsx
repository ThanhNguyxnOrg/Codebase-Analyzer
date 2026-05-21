import { Header, PanelHeader } from "./AnalyzeScreen";
import { FileCode2, Hash, MessageSquare, Minus, Check, AlertCircle } from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";

export function DashboardScreen() {
  const { result, logs } = useAnalysis();

  if (!result) {
    return (
      <div className="h-full overflow-auto bg-[#070a0f]">
        <div className="max-w-[1100px] mx-auto px-10 py-10">
          <Header title="Dashboard" subtitle="Aggregate statistics across the analyzed codebase." />
          <div className="rounded-md border border-amber-700/30 bg-amber-500/[0.04] px-4 py-4 flex items-center gap-3 text-[13px] text-amber-300 font-mono">
            <AlertCircle size={16} />
            <div>
              <div>No analysis data yet.</div>
              <div className="text-[11px] text-amber-600 mt-1">Go to the Analyze tab to scan a project first.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { langs, files, elapsed, timestamp } = result;
  const totalFiles = files.length;
  const totalLines = files.reduce((a, f) => a + f.total, 0);
  const totalCode = files.reduce((a, f) => a + f.code, 0);
  const totalComments = files.reduce((a, f) => a + f.comments, 0);
  const totalBlanks = files.reduce((a, f) => a + f.blanks, 0);
  const codePct = totalLines > 0 ? ((totalCode / totalLines) * 100).toFixed(1) : "0";
  const commentPct = totalLines > 0 ? ((totalComments / totalLines) * 100).toFixed(1) : "0";
  const blankPct = totalLines > 0 ? ((totalBlanks / totalLines) * 100).toFixed(1) : "0";
  const totalLangLines = langs.reduce((a, b) => a + b.lines, 0);
  const safeCodePct = totalLines > 0 ? totalCode / totalLines : 0;
  const safeCommentPct = totalLines > 0 ? totalComments / totalLines : 0;

  return (
    <div className="h-full overflow-auto bg-[#070a0f]">
      <div className="max-w-[1100px] mx-auto px-10 py-10">
        <Header title="Dashboard" subtitle="Aggregate statistics across the analyzed codebase." path={result.path} />

        <div className="rounded-md border border-emerald-700/30 bg-emerald-500/[0.04] px-4 py-2.5 flex items-center gap-2 text-[12px] text-emerald-300 mb-5 font-mono">
          <Check size={13} /> Analysis completed
          <span className="text-emerald-600 ml-2">· {totalFiles} files · {elapsed}s · {timestamp}</span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <Stat label="Files analyzed" value={String(totalFiles)} sub={`across ${langs.length} langs`} icon={<FileCode2 size={13} />} accent />
          <Stat label="Total lines" value={String(totalLines)} sub="incl. blanks" icon={<Hash size={13} />} />
          <Stat label="Code lines" value={String(totalCode)} sub={`${codePct}% density`} icon={<Hash size={13} />} />
          <Stat label="Comment lines" value={String(totalComments)} sub={`${commentPct}% ratio`} icon={<MessageSquare size={13} />} />
          <Stat label="Blank lines" value={String(totalBlanks)} sub={`${blankPct}% ratio`} icon={<Minus size={13} />} />
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-4 mt-5">
          <div className="rounded-lg border border-[#1f2430] bg-[#0d1117]">
            <PanelHeader label="language.distribution" right={`${totalLangLines} loc`} />
            <div className="p-5">
              <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-[#11151d]">
                {langs.map((l) => (
                  <div key={l.name} style={{ width: `${totalLangLines ? (l.lines / totalLangLines) * 100 : 0}%`, background: l.color }} />
                ))}
              </div>
              <div className="mt-5 space-y-2.5">
                {langs.map((l) => {
                  const pct = totalLangLines ? ((l.lines / totalLangLines) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={l.name} className="flex items-center gap-3 text-[12px]">
                      <span className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                      <span className="w-28 text-[#cbd5e1] truncate">{l.name}</span>
                      <div className="flex-1 h-1 rounded-full bg-[#11151d] overflow-hidden">
                        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: l.color }} />
                      </div>
                      <span className="w-10 text-right font-mono text-[#9ca3af]">{l.lines}</span>
                      <span className="w-12 text-right font-mono text-[#6b7280]">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#1f2430] bg-[#0d1117]">
            <PanelHeader label="composition" right="ratios" />
            <div className="p-5">
              <Ring total={totalLines} codePct={safeCodePct} comPct={safeCommentPct} color={langs[0]?.color || "#3b5bff"} />
              <div className="mt-4 space-y-2 text-[12px]">
                <Row dot={langs[0]?.color || "#3b5bff"} k="Code" v={String(totalCode)} pct={`${codePct}%`} />
                <Row dot="#f59e0b" k="Comments" v={String(totalComments)} pct={`${commentPct}%`} />
                <Row dot="#374151" k="Blank" v={String(totalBlanks)} pct={`${blankPct}%`} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[#1f2430] bg-[#0d1117]">
          <PanelHeader label="recent.activity" right="session log" />
          <div className="font-mono text-[11px] divide-y divide-[#161b24] max-h-[200px] overflow-auto">
            {logs.map((log, i) => (
              <div key={i} className="grid grid-cols-[80px_90px_1fr] gap-3 px-4 py-2 text-[#9ca3af]">
                <span className="text-[#4b5563]">{log.time}</span>
                <span className={
                  log.kind === "ok" ? "text-emerald-400" :
                  log.kind === "parse" ? "text-amber-400" :
                  log.kind === "scan" ? "text-[#7c9cff]" :
                  "text-[#9ca3af]"
                }>{log.kind}</span>
                <span className="truncate">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, icon, accent }: { label: string; value: string; sub: string; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-lg border bg-[#0d1117] p-4 ${accent ? "border-[#3b5bff]/40 shadow-[0_0_0_1px_#3b5bff20_inset]" : "border-[#1f2430]"}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#6b7280]">{label}</span>
        <span className={accent ? "text-[#7c9cff]" : "text-[#4b5563]"}>{icon}</span>
      </div>
      <div className="mt-2 text-[24px] tracking-tight text-[#f3f4f6] font-mono">{value}</div>
      <div className="text-[10px] font-mono text-[#4b5563] mt-1">{sub}</div>
    </div>
  );
}

function Row({ dot, k, v, pct }: { dot: string; k: string; v: string; pct: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-sm" style={{ background: dot }} />
      <span className="flex-1 text-[#cbd5e1]">{k}</span>
      <span className="font-mono text-[#9ca3af]">{v}</span>
      <span className="font-mono text-[#6b7280] w-12 text-right">{pct}</span>
    </div>
  );
}

function Ring({ total, codePct, comPct, color }: { total: number; codePct: number; comPct: number; color: string }) {
  const r = 50, c = 2 * Math.PI * r;
  return (
    <div className="flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} stroke="#374151" strokeWidth="14" fill="none" />
        <circle cx="70" cy="70" r={r} stroke="#f59e0b" strokeWidth="14" fill="none"
          strokeDasharray={`${(codePct + comPct) * c} ${c}`} />
        <circle cx="70" cy="70" r={r} stroke={color} strokeWidth="14" fill="none"
          strokeDasharray={`${codePct * c} ${c}`} />
        <text x="70" y="68" textAnchor="middle" className="fill-[#f3f4f6]" fontSize="18" fontFamily="ui-monospace" transform="rotate(90 70 70)">{total}</text>
        <text x="70" y="82" textAnchor="middle" className="fill-[#6b7280]" fontSize="9" fontFamily="ui-monospace" transform="rotate(90 70 70)">total loc</text>
      </svg>
    </div>
  );
}
