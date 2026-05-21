import { Activity, Terminal } from "lucide-react";

export function TitleBar({ path }: { path?: string }) {
  return (
    <header className="h-10 flex items-center justify-between border-b border-[#1f2430] bg-[#0c0f15] px-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-md bg-[#2563eb] flex items-center justify-center shrink-0">
          <Terminal size={13} className="text-white" />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#6b7280] font-mono min-w-0">
          <span className="text-[#cbd5e1]">codebase-analyzer</span>
          {path && (
            <>
              <span className="text-[#4b5563]">/</span>
              <span className="truncate max-w-[520px]">{path}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#6b7280]">
        <Activity size={12} className="text-emerald-400" />
        desktop app
      </div>
    </header>
  );
}
