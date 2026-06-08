import { C, mono } from "./tokens";
import { RECENT } from "./data";
import { FolderOpen } from "lucide-react";

export function Welcome({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="size-full flex flex-col items-center justify-center px-8">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 6,
          border: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <div style={{ width: 14, height: 14, background: C.accent, borderRadius: 2 }} />
      </div>
      <div style={{ ...mono, fontSize: 13, color: C.text, letterSpacing: "0.06em" }}>
        codebase-analyzer
        <span style={{ color: C.muted }}> · v0.4.2</span>
      </div>
      <div style={{ marginTop: 22, color: C.muted, fontSize: 13 }}>
        Open a folder to begin
      </div>

      <button
        onClick={onOpen}
        className="flex items-center gap-2"
        style={{
          marginTop: 18,
          padding: "10px 18px",
          background: C.accent,
          color: "#1a1208",
          border: "none",
          borderRadius: 4,
          ...mono,
          fontSize: 12,
          letterSpacing: "0.04em",
          cursor: "pointer",
        }}
      >
        <FolderOpen size={14} strokeWidth={2} />
        OPEN FOLDER
        <kbd
          style={{
            marginLeft: 6,
            padding: "1px 5px",
            borderRadius: 3,
            background: "#00000033",
            fontSize: 10,
          }}
        >
          ⌘O
        </kbd>
      </button>

      <div style={{ marginTop: 56, width: 520 }}>
        <div
          style={{
            ...mono,
            fontSize: 11,
            color: C.muted,
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          RECENT PROJECTS
        </div>
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {RECENT.map((r) => (
            <button
              key={r.path}
              onClick={onOpen}
              className="w-full flex items-center text-left"
              style={{
                padding: "10px 4px",
                borderBottom: `1px solid ${C.border}`,
                background: "transparent",
                cursor: "pointer",
                ...mono,
                fontSize: 12,
                color: C.text,
              }}
            >
              <span style={{ color: C.accent, marginRight: 10 }}>›</span>
              <span style={{ flex: 1 }}>{r.path}</span>
              <span style={{ color: C.muted, marginRight: 16 }}>{r.files} files</span>
              <span style={{ color: C.muted }}>{r.date}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
