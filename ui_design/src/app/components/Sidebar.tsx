import { Home, FolderSearch, LayoutDashboard, FileCode2, FileText, Settings, Terminal } from "lucide-react";
import { shortcut } from "../utils/platform";

type Screen = "home" | "analyze" | "dashboard" | "files" | "report" | "settings";

const items: { id: Screen; label: string; icon: any; key: string }[] = [
  { id: "home", label: "Home", icon: Home, key: "1" },
  { id: "analyze", label: "Analyze", icon: FolderSearch, key: "2" },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, key: "3" },
  { id: "files", label: "Files", icon: FileCode2, key: "4" },
  { id: "report", label: "Report", icon: FileText, key: "5" },
  { id: "settings", label: "Settings", icon: Settings, key: "," },
];

export function Sidebar({ active, onChange, analyzing }: { active: Screen; onChange: (s: Screen) => void; analyzing?: boolean }) {
  return (
    <aside className="w-[220px] shrink-0 bg-[#0a0d12] border-r border-[#1f2430] flex flex-col">
      <div className="px-4 py-4 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center">
            <Terminal size={14} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] text-[#e5e7eb] tracking-tight">Codebase Analyzer</div>
            <div className="text-[10px] text-[#6b7280] font-mono">v1.0.0 · stable</div>
          </div>
        </div>
      </div>

      <div className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider text-[#4b5563] font-mono">Workspace</div>
      <nav className="flex-1 px-2 space-y-0.5">
        {items.map(({ id, label, icon: Icon, key }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`w-full group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                isActive
                  ? "bg-[#1a2030] text-[#e5e7eb] border border-[#2a3346]"
                  : "text-[#9ca3af] hover:bg-[#11151d] hover:text-[#e5e7eb] border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={14} className={isActive ? "text-[#7c9cff]" : "text-[#6b7280] group-hover:text-[#9ca3af]"} />
                {label}
              </span>
              <span className="text-[10px] font-mono text-[#4b5563]">{shortcut(key)}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-[#1f2430] text-[11px] text-[#6b7280] font-mono">
        <div className="flex items-center gap-2">
          {analyzing ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse" />
              <span>analyzing…</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span>idle · ready</span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

export type { Screen };
