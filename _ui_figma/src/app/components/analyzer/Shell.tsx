import { Home, LayoutDashboard, FolderTree, Share2, Download, Minus, Square, X } from "lucide-react";
import { C, mono } from "./tokens";

export type Screen = "welcome" | "dashboard" | "files" | "graph" | "export";

const ITEMS: { id: Screen; icon: any; label: string; key: string }[] = [
  { id: "welcome", icon: Home, label: "Home", key: "1" },
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", key: "2" },
  { id: "files", icon: FolderTree, label: "Files", key: "3" },
  { id: "graph", icon: Share2, label: "Graph", key: "4" },
  { id: "export", icon: Download, label: "Export", key: "5" },
];

export function Shell({
  screen,
  onChange,
  children,
  progress,
  status,
}: {
  screen: Screen;
  onChange: (s: Screen) => void;
  children: React.ReactNode;
  progress?: number;
  status: string;
}) {
  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Title bar — OS-agnostic */}
      <div
        className="flex items-center select-none"
        style={{ height: 30, borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: 14, flex: 1 }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 1,
              background: C.accent,
            }}
          />
          <div
            style={{
              ...mono,
              color: C.text,
              fontSize: 11,
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            CODEBASE ANALYZER
          </div>
          <div style={{ ...mono, color: C.muted, fontSize: 11, marginLeft: 8 }}>
            — ~/projects/codebase-analyzer
          </div>
        </div>
        <div className="flex" style={{ height: "100%" }}>
          {[Minus, Square, X].map((Icon, i) => (
            <button
              key={i}
              className="flex items-center justify-center"
              style={{
                width: 42,
                height: "100%",
                background: "transparent",
                border: "none",
                color: C.muted,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  i === 2 ? "#e8443e" : "#ffffff0d";
                (e.currentTarget as HTMLElement).style.color = i === 2 ? "#fff" : C.text;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = C.muted;
              }}
            >
              <Icon size={12} strokeWidth={1.75} />
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, position: "relative" }}>
        {progress !== undefined && progress < 100 && (
          <div
            style={{
              height: 2,
              width: `${progress}%`,
              background: C.accent,
              transition: "width 200ms linear",
            }}
          />
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar */}
        <nav
          className="flex flex-col items-center py-3"
          style={{ width: 48, borderRight: `1px solid ${C.border}`, gap: 2 }}
        >
          {ITEMS.map((it) => {
            const active = screen === it.id;
            const Icon = it.icon;
            return (
              <button
                key={it.id}
                onClick={() => onChange(it.id)}
                title={`${it.label} (⌘${it.key})`}
                className="flex items-center justify-center relative group"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 4,
                  background: active ? `${C.accent}1a` : "transparent",
                  color: active ? C.accent : C.muted,
                  border: "1px solid transparent",
                  cursor: "pointer",
                  transition: "color 120ms, background 120ms",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = C.text;
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = C.muted;
                }}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      left: -1,
                      top: 6,
                      bottom: 6,
                      width: 2,
                      background: C.accent,
                      borderRadius: 1,
                    }}
                  />
                )}
                <Icon size={16} strokeWidth={1.75} />
              </button>
            );
          })}
          <div className="flex-1" />
          <div
            style={{
              ...mono,
              fontSize: 9,
              color: C.muted,
              letterSpacing: "0.1em",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              padding: "8px 0",
            }}
          >
            v0.4.2
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center px-3"
        style={{
          height: 22,
          borderTop: `1px solid ${C.border}`,
          ...mono,
          fontSize: 10.5,
          color: C.muted,
          letterSpacing: "0.02em",
        }}
      >
        <span
          style={{
            color: progress !== undefined && progress < 100 ? C.accent : "#4ade80",
            marginRight: 8,
            fontSize: 8,
          }}
        >
          ●
        </span>
        {status}
        <div className="flex-1" />
        <span>892 files</span>
        <span style={{ margin: "0 10px", color: C.border }}>│</span>
        <span>47,382 loc</span>
        <span style={{ margin: "0 10px", color: C.border }}>│</span>
        <span>UTF-8</span>
        <span style={{ margin: "0 10px", color: C.border }}>│</span>
        <span>↑ 1.2s</span>
      </div>
    </div>
  );
}
