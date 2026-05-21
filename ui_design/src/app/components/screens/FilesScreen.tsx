import { useState, useMemo } from "react";
import { Header, PanelHeader } from "./AnalyzeScreen";
import { Search, ArrowUpDown, Filter, AlertCircle } from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";
import { shortcut } from "../../utils/platform";

type SortKey = "file" | "total" | "code" | "comments" | "blanks";

export function FilesScreen() {
  const { result } = useAnalysis();
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);

  if (!result) {
    return (
      <div className="h-full overflow-auto bg-[#070a0f]">
        <div className="max-w-[1200px] mx-auto px-10 py-10">
          <Header title="Files" subtitle="Per-file breakdown of the analyzed project." />
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

  const rows = result.files;
  const langSet = ["All", ...Array.from(new Set(rows.map((r) => r.lang)))];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = useMemo(() => {
    let data = rows.filter((r) =>
      (lang === "All" || r.lang === lang) && r.file.toLowerCase().includes(q.toLowerCase())
    );
    data = [...data].sort((a, b) => {
      const av = sortKey === "file" ? a.file : a[sortKey];
      const bv = sortKey === "file" ? b.file : b[sortKey];
      if (typeof av === "string" && typeof bv === "string") return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return data;
  }, [rows, lang, q, sortKey, sortAsc]);

  const extensions = Array.from(new Set(rows.map((r) => {
    const dot = r.file.lastIndexOf(".");
    return dot >= 0 ? r.file.slice(dot) : "";
  }).filter(Boolean)));

  return (
    <div className="h-full overflow-auto bg-[#070a0f]">
      <div className="max-w-[1200px] mx-auto px-10 py-10">
        <Header title="Files" subtitle="Per-file breakdown of the analyzed project." path={result.path} />

        <div className="rounded-lg border border-[#1f2430] bg-[#0d1117]">
          <PanelHeader label="files.table" right={`${filtered.length} of ${rows.length}`} />
          <div className="px-4 py-3 border-b border-[#1f2430] flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#0a0d12] border border-[#1f2430] flex-1 max-w-[320px] focus-within:border-[#3b5bff]/60 transition-colors">
              <Search size={12} className="text-[#6b7280]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search files…"
                className="flex-1 bg-transparent outline-none text-[12px] text-[#e5e7eb] placeholder:text-[#4b5563] font-mono"
              />
              <kbd className="text-[10px] font-mono text-[#4b5563]">{shortcut("K")}</kbd>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono">
              <Filter size={11} className="text-[#6b7280] mr-1" />
              {langSet.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-md border cursor-pointer transition-colors ${
                    lang === l
                      ? "border-[#3b5bff]/50 bg-[#3b5bff]/10 text-[#cbd5ff]"
                      : "border-[#1f2430] text-[#9ca3af] hover:bg-[#11151d]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="ml-auto text-[11px] font-mono text-[#4b5563]">{extensions.join(" · ")}</div>
          </div>

          <div className="font-mono text-[12px]">
            <div className="grid grid-cols-[1.6fr_120px_80px_80px_100px_80px] gap-3 px-4 py-2 border-b border-[#1f2430] text-[10px] uppercase tracking-wider text-[#4b5563]">
              <SortHeader active={sortKey === "file"} asc={sortAsc} onClick={() => toggleSort("file")}>File</SortHeader>
              <div>Language</div>
              <SortHeader active={sortKey === "total"} asc={sortAsc} onClick={() => toggleSort("total")} align="right">Total</SortHeader>
              <SortHeader active={sortKey === "code"} asc={sortAsc} onClick={() => toggleSort("code")} align="right">Code</SortHeader>
              <SortHeader active={sortKey === "comments"} asc={sortAsc} onClick={() => toggleSort("comments")} align="right">Comments</SortHeader>
              <SortHeader active={sortKey === "blanks"} asc={sortAsc} onClick={() => toggleSort("blanks")} align="right">Blanks</SortHeader>
            </div>
            <div className="divide-y divide-[#161b24]">
              {filtered.map((r, i) => (
                <div key={r.file} className="grid grid-cols-[1.6fr_120px_80px_80px_100px_80px] gap-3 px-4 py-2 hover:bg-[#11151d] group transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] text-[#4b5563] w-6">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[#e5e7eb] truncate">{r.file}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: r.color }} />
                    <span className="text-[#cbd5e1]">{r.lang}</span>
                  </div>
                  <div className="text-right text-[#cbd5e1]">{r.total}</div>
                  <div className="text-right text-[#7c9cff]">{r.code}</div>
                  <div className="text-right text-amber-300/80">{r.comments}</div>
                  <div className="text-right text-[#6b7280]">{r.blanks}</div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-[#1f2430] flex items-center justify-between text-[10px] text-[#4b5563]">
              <span>showing {filtered.length} rows</span>
              <span className="flex items-center gap-1">
                <ArrowUpDown size={10} />
                sort by {sortKey} {sortAsc ? "↑" : "↓"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortHeader({ children, active, asc, onClick, align }: { children: React.ReactNode; active: boolean; asc: boolean; onClick: () => void; align?: "right" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 cursor-pointer hover:text-[#9ca3af] transition-colors ${align === "right" ? "justify-end" : ""} ${active ? "text-[#9ca3af]" : ""}`}
    >
      {children}
      {active && <span className="text-[8px]">{asc ? "▲" : "▼"}</span>}
    </button>
  );
}
